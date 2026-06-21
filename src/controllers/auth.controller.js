import ENVIRONMENT from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

class AuthController {
    async register(req, res) {
        const { name, email, password } = req.body;

        // Validaciones
        if (!name || name.length <= 2) {
            throw new ServerError("Nombre debe ser mayor a 2 caracteres", 400)
        }

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new ServerError("Email inválido", 400)
        }

        if (!password || password.length < 6) {
            throw new ServerError("Password debe tener al menos 6 caracteres", 400)
        }

        const existingUser = await userRepository.getByEmail(email);
        if (existingUser) {
            throw new ServerError("El email ya está registrado", 400)
        }

        const hashed_password = await bcrypt.hash(password, 12);

        const newUser = await userRepository.create(name, email, hashed_password);

        const verification_token = jwt.sign(
            {
                email: email
            },
            ENVIRONMENT.JWT_SECRET
        )

        await mailer_transport.sendMail(
            {
                to: email,
                from: ENVIRONMENT.GMAIL_USERNAME,
                subject: "Verifica tu mail",
                html: `
                        <h1>Bienvenido a SLACK</h1>
                        <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>Click aqui</a> para verificar tu cuenta
                    `
            }
        )

        return res.status(201).json({
            message: "Usuario registrado con éxito",
            ok: true,
            status: 201,
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.nombre,
                    email: newUser.email
                }
            }
        });

    }


    /**
     * Controlador de express para la verificacion del mail
     * param {Object} req - Objeto de request de express
     * param {Object} res - Objeto de response de express
     * 
     * Esperamos recibir un query param con el token llamado verification_token
     */
    async verifyEmail(req, res) {
        try {
            const { verification_token } = req.query;

            if (!verification_token) {
                throw new ServerError("Falta token de verificación", 400);
            }
            const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET)
            const { email } = payload
            const user = await userRepository.getByEmail(email);

            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            if (user.email_verificado) {
                throw new ServerError("Este email ya ha sido verificado", 400);
            }

            await userRepository.updateById(user._id, { email_verificado: true });

            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Email verificado correctamente. ¡Ya puedes usar tu cuenta!"
            });

        }
        catch (error) {
            console.log(error)
            if (
                error instanceof jwt.JsonWebTokenError
                ||
                error instanceof jwt.NotBeforeError
                ||
                error instanceof jwt.TokenExpiredError
            ) {
                return res.status(401).json(
                    {
                        message: "Token invalido",
                        ok: false,
                        status: 401
                    }
                )
            }
            else if (error instanceof ServerError) {
                return res.status(error.status).json(
                    {
                        message: error.message,
                        ok: false,
                        status: error.status
                    }
                )
            }
            else {
                console.error('Error critico:', error);
                return res.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }

        }
    }

    async login(request, response) {

        const { email, password } = request.body

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new ServerError("Email inválido", 400)
        }

        if (!password || password.length < 6) {
            throw new ServerError("Contraseña invalida", 400)
        }

        const user_found = await userRepository.getByEmail(email)

        if (!user_found) {
            throw new ServerError("Usuario no registrado", 404)
        }

        if (!user_found.email_verificado) {
            throw new ServerError("Usuario con verificacion de mail pendiente", 401)
        }

        const is_same_password = await bcrypt.compare(password, user_found.password)

        if (!is_same_password) {
            throw new ServerError("Credenciales invalidas", 401)
        }

        //Ese objeto es el que se guardara dentro del token de authorizacion
        const profile_info = {
            nombre: user_found.nombre,
            email: user_found.email,
            id: user_found._id,
            fecha_creacion: user_found.fecha_creacion
        }

        //Aca creamos el token
        const access_token = jwt.sign(
            profile_info,
            ENVIRONMENT.JWT_SECRET,
            { expiresIn: '7d' } //El token de sesion expira en 7 dias
        )

        return response.status(200).json({
            ok: true,
            status: 200,
            message: 'Usuario autentificado exitosamente',
            data: {
                access_token
            }
        })


    }


    /* --- 4. SOLICITUD RESTABLECER CONTRASEÑA --- */
    async resetPasswordRequest(request, response) {

        const { email } = request.body;

        if (!email) {
            throw new ServerError("El email es obligatorio", 400);
        }

        const user = await userRepository.getByEmail(email);

        //Esto es una decision de negocio, no quiere decir que siempre deba ser asi, un 404 not found podria estar bien tambien o
        if (!user) {
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
            });
        }

        const secret_key = ENVIRONMENT.JWT_SECRET + user.password;

        const token = jwt.sign(
            { email: user.email, id: user._id },
            secret_key,
            { expiresIn: '15m' } //El token expiran en 15m
        );

        const reset_link = `${ENVIRONMENT.URL_FRONTEND}/reset-password?token=${token}`;

        await mailer_transport.sendMail({
            from: 'Tu App <no-reply@tuapp.com>',
            to: user.email,
            subject: 'Restablece tu contraseña',
            html: `
                    <h1>Restablecimiento de Contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                    <a href="${reset_link}">Restablecer mi contraseña</a>
                    <p>Este enlace expirará en 15 minutos. Si tú no solicitaste esto, puedes ignorar este correo sin problemas.</p>
                `
        });

        //RETURN EXITO REAL
        return response.status(200).json({
            ok: true,
            status: 200,
            message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
        });

    }

    async resetPasswordConfirm(request, response) {

        const auth_header = request.headers.authorization

        if (!auth_header) {
            throw new ServerError('Falta header de autentificacion', 401)
        }

        const reset_token = auth_header.split(' ')[1]

        if (!reset_token) {
            throw new ServerError('Falta el token de autorizacion', 401)
        }

        const { email } = jwt.decode(reset_token)
        const user = await userRepository.getByEmail(email)
        if (!user) {
            throw new ServerError("Usuario no encontrado", 404);
        }


        const secret_key = ENVIRONMENT.JWT_SECRET + user.password;
        const decoded = jwt.verify(reset_token, secret_key);

        const { newPassword } = request.body;

        if (!newPassword || newPassword.length < 6) {
            throw new ServerError("Contraseña invalida", 400);
        }

        const new_password_hashed = await bcrypt.hash(newPassword, 10);
        await userRepository.updateById(user._id, { password: new_password_hashed });

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Contraseña restablecida exitosamente"
        });

    }
}

const authController = new AuthController();


export default authController


/* 

Como manejar un inicio de sesion?

Vamos a tener un endpoint 
POST /api/auth/login
    body: {email, password}

    - Buscar al usuario por email
    - Validar la contraseña (await bcrypt.compare(texto_original, texto_hasheado) esto devolvera un booleano)
    - Crear un jsonwebtoken con los datos de sesion del usuario (username, email, id, created_at)
    - responder con ese token (access_token) al cliente
*/
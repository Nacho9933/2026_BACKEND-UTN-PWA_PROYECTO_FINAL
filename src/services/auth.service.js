import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import mailService from "./mail.service.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
    async register(name, email, password) {
        const existingUser = await userRepository.getByEmail(email);
        if (existingUser) {
            throw new ServerError("El email ya está registrado", 400);
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const newUser = await userRepository.create(name, email, hashed_password);

        const verification_token = jwt.sign({ email }, ENVIRONMENT.JWT_SECRET);
        await mailService.sendVerificationEmail(email, verification_token);

        return newUser;
    }

    async verifyEmail(verification_token) {
        if (!verification_token) {
            throw new ServerError("Falta token de verificación", 400);
        }

        const { email } = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET);
        const user = await userRepository.getByEmail(email);

        if (!user) {
            throw new ServerError("Usuario no encontrado", 404);
        }
        if (user.email_verificado) {
            throw new ServerError("Este email ya ha sido verificado", 400);
        }

        await userRepository.updateById(user._id, { email_verificado: true });
    }

    async login(email, password) {
        const user_found = await userRepository.getByEmail(email);

        if (!user_found) {
            throw new ServerError("Usuario no registrado", 404);
        }
        if (!user_found.email_verificado) {
            throw new ServerError("Usuario con verificacion de mail pendiente", 401);
        }

        const is_same_password = await bcrypt.compare(password, user_found.password);
        if (!is_same_password) {
            throw new ServerError("Credenciales invalidas", 401);
        }

        const profile_info = {
            nombre: user_found.nombre,
            email: user_found.email,
            id: user_found._id,
            fecha_creacion: user_found.fecha_creacion
        };

        return jwt.sign(profile_info, ENVIRONMENT.JWT_SECRET, { expiresIn: '7d' });
    }

    async resetPasswordRequest(email) {
        const user = await userRepository.getByEmail(email);

        //si el usuario no existe no hacemos nada; el controller responde igual para no filtrar qué emails existen
        if (!user) {
            return;
        }

        const secret_key = ENVIRONMENT.JWT_SECRET + user.password;
        const token = jwt.sign(
            { email: user.email, id: user._id },
            secret_key,
            { expiresIn: '15m' }
        );

        const reset_link = `${ENVIRONMENT.URL_FRONTEND}/reset-password?reset_password_token=${token}`;
        await mailService.sendResetPasswordEmail(user.email, reset_link);
    }

    async resetPasswordConfirm(auth_header, newPassword) {
        if (!auth_header) {
            throw new ServerError('Falta header de autentificacion', 401);
        }

        const reset_token = auth_header.split(' ')[1];
        if (!reset_token) {
            throw new ServerError('Falta el token de autorizacion', 401);
        }

        const { email } = jwt.decode(reset_token) || {};
        const user = await userRepository.getByEmail(email);
        if (!user) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        //la clave secreta incluye el hash actual: el token deja de ser válido apenas se cambia la contraseña
        const secret_key = ENVIRONMENT.JWT_SECRET + user.password;
        jwt.verify(reset_token, secret_key);

        const new_password_hashed = await bcrypt.hash(newPassword, 10);
        await userRepository.updateById(user._id, { password: new_password_hashed });
    }
}

const authService = new AuthService();
export default authService;

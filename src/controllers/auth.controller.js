import authService from "../services/auth.service.js";

class AuthController {
    async register(req, res) {
        const { name, email, password } = req.body;

        const newUser = await authService.register(name, email, password);

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

    async verifyEmail(req, res) {
        const { verification_token } = req.query;

        await authService.verifyEmail(verification_token);

        return res.status(200).json({
            ok: true,
            status: 200,
            message: "Email verificado correctamente. ¡Ya puedes usar tu cuenta!"
        });
    }

    async login(request, response) {
        const { email, password } = request.body;

        const { access_token, refresh_token } = await authService.login(email, password);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: 'Usuario autentificado exitosamente',
            data: {
                access_token,
                refresh_token
            }
        });
    }

    async refresh(request, response) {
        const { refresh_token } = request.body;

        const access_token = await authService.refreshAccessToken(refresh_token);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: 'Token renovado exitosamente',
            data: {
                access_token
            }
        });
    }

    async resetPasswordRequest(request, response) {
        const { email } = request.body;

        await authService.resetPasswordRequest(email);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
        });
    }

    async resetPasswordConfirm(request, response) {
        const auth_header = request.headers.authorization;
        const { newPassword } = request.body;

        await authService.resetPasswordConfirm(auth_header, newPassword);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Contraseña restablecida exitosamente"
        });
    }
}

const authController = new AuthController();
export default authController;

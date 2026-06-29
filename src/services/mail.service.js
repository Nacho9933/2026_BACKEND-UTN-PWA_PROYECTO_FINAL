import ENVIRONMENT from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js";


class MailService {
    async sendVerificationEmail (email, verification_token){
        await mailer_transport.sendMail({
            to: email,
            from: ENVIRONMENT.GMAIL_USERNAME,
            subject: "Verifica tu mail",
            html: `
                    <h1>Bienvenido a SLACK</h1>
                    <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>Click aqui</a> para verificar tu cuenta
                `
        });
    }

    async sendResetPasswordEmail (email, reset_link){
        await mailer_transport.sendMail({
            from: 'Tu App <no-reply@tuapp.com>',
            to: email,
            subject: 'Restablece tu contraseña',
            html: `
                    <h1>Restablecimiento de Contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                    <a href="${reset_link}">Restablecer mi contraseña</a>
                    <p>Este enlace expirará en 15 minutos. Si tú no solicitaste esto, puedes ignorar este correo sin problemas.</p>
                `
        });
    }

    async sendInvitationMemberEmail (invited_email, accept_url, reject_url, role){
        try {
            await mailer_transport.sendMail({
                from: `"Slack UTN" <${ENVIRONMENT.GMAIL_USERNAME}>`,
                to: invited_email,
                subject: 'Invitación a Espacio de Trabajo',
                html: `
                    <div style="font-family: Arial; padding: 20px; text-align: center;">
                        <h2>¡Has sido invitado!</h2>
                        <p>Alguien te ha invitado a colaborar en un espacio de trabajo con el rol de <b>${role}</b>.</p>
                        <div style="margin: 30px 0; display: flex; justify-content: center; gap: 20px;">
                            <a href="${accept_url}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">ACEPTAR INVITACIÓN</a>
                            <a href="${reject_url}" style="background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">RECHAZAR</a>
                        </div>
                        <p style="font-size: 12px; color: gray;">Si no conoces este espacio, ignora este mensaje o presiona rechazar.</p>
                    </div>
                `
            });
            console.log("¡Correo de invitación enviado a:", invited_email);
    } catch (error) {
        console.error("Error al enviar la invitación:", error);
        throw error
    }
    }
}

const mailService = new MailService()
export default mailService
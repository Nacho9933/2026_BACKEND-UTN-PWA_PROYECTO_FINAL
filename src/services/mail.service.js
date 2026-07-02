import sgMail from "@sendgrid/mail";
import ENVIRONMENT from "../config/environment.config.js";

//SendGrid manda por HTTP (puerto 443), a diferencia del SMTP de Gmail que se cuelga en Vercel serverless
sgMail.setApiKey(ENVIRONMENT.SENDGRID_API_KEY);

class MailService {
    //envía sin romper el flujo: si el mail falla lo loguea y sigue (register/reset/invitación no se rompen)
    async #send({ to, subject, html }) {
        try {
            await sgMail.send({
                to,
                //el remitente DEBE ser el email verificado en SendGrid (Single Sender)
                from: { email: ENVIRONMENT.SENDGRID_FROM_EMAIL, name: "Slack UTN" },
                subject,
                html
            });
            console.log("Correo enviado a:", to);
            return true;
        } catch (error) {
            //SendGrid devuelve el detalle real del error en error.response.body
            console.error("No se pudo enviar el correo a", to, "-", error.response?.body?.errors || error.message);
            return false;
        }
    }

    async sendVerificationEmail(email, verification_token) {
        return await this.#send({
            to: email,
            subject: "Verifica tu mail",
            html: `
                    <h1>Bienvenido a SLACK</h1>
                    <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>Click aqui</a> para verificar tu cuenta
                `
        });
    }

    async sendResetPasswordEmail(email, reset_link) {
        return await this.#send({
            to: email,
            subject: "Restablece tu contraseña",
            html: `
                    <h1>Restablecimiento de Contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                    <a href="${reset_link}">Restablecer mi contraseña</a>
                    <p>Este enlace expirará en 15 minutos. Si tú no solicitaste esto, puedes ignorar este correo sin problemas.</p>
                `
        });
    }

    async sendInvitationMemberEmail(invited_email, accept_url, reject_url, role) {
        return await this.#send({
            to: invited_email,
            subject: "Invitación a Espacio de Trabajo",
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
    }
}

const mailService = new MailService()
export default mailService

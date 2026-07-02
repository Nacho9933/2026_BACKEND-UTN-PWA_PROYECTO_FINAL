import nodemailer from 'nodemailer'
import ENVIRONMENT from './environment.config.js'

const mailer_transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIRONMENT.GMAIL_USERNAME,
        pass: ENVIRONMENT.GMAIL_PASSWORD
    },
    //en serverless (Vercel) el SMTP saliente suele colgarse: cortamos rápido en vez de agotar el timeout de la función
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
})

export default mailer_transport
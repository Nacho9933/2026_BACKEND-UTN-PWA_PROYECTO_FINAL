import dotenv from 'dotenv'

dotenv.config()

const ENVIRONMENT = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    MODE: process.env.MODE,
    PORT: process.env.PORT,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
    URL_BACKEND: process.env.URL_BACKEND,
    URL_FRONTEND: process.env.URL_FRONTEND,
    JWT_SECRET: process.env.JWT_SECRET,
    //secreto aparte para los refresh tokens: así un access token no sirve como refresh ni viceversa
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET
}

export default ENVIRONMENT
import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import express from "express";
import dns from 'dns';
import cors from 'cors';
import authRouter from "./routes/auth.router.js";
import workspaceRouter from "./routes/workspace.router.js";
import errorHandlerMiddleware from "./middlewares/error.middleware.js";

//Forzamos IPv4 primero para evitar ETIMEDOUT al resolver MongoDB Atlas por IPv6
dns.setDefaultResultOrder('ipv4first');

if (ENVIRONMENT.MODE === 'development') {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB();

const app = express();
const PORT = ENVIRONMENT.PORT;

app.use(cors({
    origin: ENVIRONMENT.MODE === 'production'
        ? ENVIRONMENT.URL_FRONTEND
        : '*'
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter);

//va al final: corre cuando un controller lanza una excepción
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

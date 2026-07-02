import mongoose from "mongoose"
import ENVIRONMENT from "./environment.config.js"

//Cacheamos la promesa de conexión entre invocaciones: Vercel reutiliza el mismo
//proceso "caliente", así no abrimos una conexión nueva en cada request.
let connectionPromise = null

const connectMongoDB = async () => {
    //readyState === 1 => ya hay una conexión viva, la reutilizamos sin esperar nada
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection
    }

    //Si no hay una conexión en curso, la arrancamos y guardamos la promesa
    if (!connectionPromise) {
        connectionPromise = mongoose.connect(
            ENVIRONMENT.MONGO_DB_CONNECTION_STRING + '/' + ENVIRONMENT.MONGO_DB_NAME, {
                //si Atlas no responde, falla en 10s (en vez de colgarse) para poder reintentar
                serverSelectionTimeoutMS: 10000
            }
        )
            .then((mongooseInstance) => {
                console.log("La conexion con MongoDB funciona")
                return mongooseInstance
            })
            .catch((error) => {
                //reseteamos para que la próxima request pueda volver a intentar conectar
                connectionPromise = null
                console.error("Hubo un fallo en la conexion de la DB", error)
                throw error
            })
    }

    return connectionPromise
}

export default connectMongoDB
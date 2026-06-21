/* Modelo de mongoose para los mensajes dentro de un canal */
import mongoose from "mongoose";
import { CHANNEL_COLLECTION_NAME } from "./channel.model.js";
import { USER_COLLECTION_NAME } from "./user.model.js";

const messageSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: true
    },
    fk_channel_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: CHANNEL_COLLECTION_NAME
    },
    fk_user_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: USER_COLLECTION_NAME
    },
    fecha_creacion: {
        type: Date,
        required: true,
        default: Date.now
    },
    estado: {
        type: Boolean,
        required: true,
        default: true
    }
})

export const MESSAGE_COLLECTION_NAME = "Message"
const Message = mongoose.model(MESSAGE_COLLECTION_NAME, messageSchema)

export default Message

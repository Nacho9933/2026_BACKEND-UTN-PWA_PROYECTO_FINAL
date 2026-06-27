import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";

const directMessageSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: true
    },
    fk_sender_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: USER_COLLECTION_NAME
    },
    fk_receiver_id: {
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

export const DIRECT_MESSAGE_COLLECTION_NAME = "DirectMessage"
const DirectMessage = mongoose.model(DIRECT_MESSAGE_COLLECTION_NAME, directMessageSchema)

export default DirectMessage

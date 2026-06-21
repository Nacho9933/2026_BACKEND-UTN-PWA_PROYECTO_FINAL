/* Modelo de mongoose para los canales de un espacio de trabajo */
import mongoose from "mongoose";
import { WORKSPACE_COLLECTION_NAME } from "./workspace.model.js";

const channelSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: false
    },
    fk_workspace_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: WORKSPACE_COLLECTION_NAME
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

export const CHANNEL_COLLECTION_NAME = "Channel"
const Channel = mongoose.model(CHANNEL_COLLECTION_NAME, channelSchema)

export default Channel

import mongoose from "mongoose";
import ServerError from "../helpers/serverError.helper.js";
import directMessageRepository from "../repositories/directMessage.repository.js";
import userRepository from "../repositories/user.repository.js";

class DirectMessageController {
    async getConversations(request, response) {
        const user_id = request.user.id;

        const conversations = await directMessageRepository.getConversationsForUser(user_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Conversaciones obtenidas con éxito",
            data: {
                conversations
            }
        });
    }

    async getConversation(request, response) {
        const user_id = request.user.id;
        const { user_id: other_user_id } = request.params;
        const { page = 1, limit = 20 } = request.query;

        if (!mongoose.Types.ObjectId.isValid(other_user_id)) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        const other_user = await userRepository.getById(other_user_id);
        if (!other_user || !other_user.activo) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        const page_num = Math.max(1, parseInt(page) || 1);
        const limit_num = Math.min(100, Math.max(1, parseInt(limit) || 20));

        const result = await directMessageRepository.getConversation(
            user_id,
            other_user_id,
            page_num,
            limit_num
        );

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Conversación obtenida con éxito",
            data: result
        });
    }

    async send(request, response) {
        const user_id = request.user.id;
        const { user_id: receiver_id } = request.params;
        const { contenido } = request.body;

        if (!mongoose.Types.ObjectId.isValid(receiver_id)) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        if (receiver_id === user_id) {
            throw new ServerError("No puedes enviarte un mensaje a ti mismo", 400);
        }

        const receiver = await userRepository.getById(receiver_id);
        if (!receiver || !receiver.activo) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        const new_message = await directMessageRepository.create(
            contenido,
            user_id,
            receiver_id
        );

        return response.status(201).json({
            ok: true,
            status: 201,
            message: "Mensaje enviado con éxito",
            data: {
                message: new_message
            }
        });
    }

    async updateById(request, response) {
        const user_id = request.user.id;
        const { message_id } = request.params;
        const { contenido } = request.body;

        if (!mongoose.Types.ObjectId.isValid(message_id)) {
            throw new ServerError("Mensaje no encontrado", 404);
        }

        const message = await directMessageRepository.getById(message_id);
        if (!message || !message.estado) {
            throw new ServerError("Mensaje no encontrado", 404);
        }

        //solo el autor puede editar su mensaje
        if (message.fk_sender_id._id.toString() !== user_id) {
            throw new ServerError("No tienes permiso para editar este mensaje", 403);
        }

        const updated_message = await directMessageRepository.updateById(message_id, { contenido });

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Mensaje actualizado con éxito",
            data: {
                message: updated_message
            }
        });
    }

    async deleteById(request, response) {
        const user_id = request.user.id;
        const { message_id } = request.params;

        if (!mongoose.Types.ObjectId.isValid(message_id)) {
            throw new ServerError("Mensaje no encontrado", 404);
        }

        const message = await directMessageRepository.getById(message_id);
        if (!message || !message.estado) {
            throw new ServerError("Mensaje no encontrado", 404);
        }

        //solo el autor puede borrar su mensaje
        if (message.fk_sender_id._id.toString() !== user_id) {
            throw new ServerError("No tienes permiso para eliminar este mensaje", 403);
        }

        const deleted_message = await directMessageRepository.softDeleteById(message_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Mensaje eliminado con éxito",
            data: {
                message: deleted_message
            }
        });
    }
}

const directMessageController = new DirectMessageController();
export default directMessageController;

import mongoose from "mongoose";
import ServerError from "../helpers/serverError.helper.js";
import directMessageRepository from "../repositories/directMessage.repository.js";
import userRepository from "../repositories/user.repository.js";

class DirectMessageService {
    async getConversations(user_id) {
        return await directMessageRepository.getConversationsForUser(user_id);
    }

    async getConversation(user_id, other_user_id, page, limit) {
        await this.#ensureUserExists(other_user_id);

        const page_num = Math.max(1, parseInt(page) || 1);
        const limit_num = Math.min(100, Math.max(1, parseInt(limit) || 20));

        return await directMessageRepository.getConversation(user_id, other_user_id, page_num, limit_num);
    }

    async send(user_id, receiver_id, contenido) {
        if (receiver_id === user_id) {
            throw new ServerError("No puedes enviarte un mensaje a ti mismo", 400);
        }

        await this.#ensureUserExists(receiver_id);

        return await directMessageRepository.create(contenido, user_id, receiver_id);
    }

    async updateById(user_id, message_id, contenido) {
        await this.#ensureOwnMessage(user_id, message_id, "editar");
        return await directMessageRepository.updateById(message_id, { contenido });
    }

    async deleteById(user_id, message_id) {
        await this.#ensureOwnMessage(user_id, message_id, "eliminar");
        return await directMessageRepository.softDeleteById(message_id);
    }

    async #ensureUserExists(user_id) {
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new ServerError("Usuario no encontrado", 404);
        }
        const user = await userRepository.getById(user_id);
        if (!user || !user.activo) {
            throw new ServerError("Usuario no encontrado", 404);
        }
        return user;
    }

    //valida que el mensaje exista y que el usuario sea su autor
    async #ensureOwnMessage(user_id, message_id, accion) {
        if (!mongoose.Types.ObjectId.isValid(message_id)) {
            throw new ServerError("Mensaje no encontrado", 404);
        }
        const message = await directMessageRepository.getById(message_id);
        if (!message || !message.estado) {
            throw new ServerError("Mensaje no encontrado", 404);
        }
        if (message.fk_sender_id._id.toString() !== user_id) {
            throw new ServerError(`No tienes permiso para ${accion} este mensaje`, 403);
        }
        return message;
    }
}

const directMessageService = new DirectMessageService();
export default directMessageService;

import ServerError from "../helpers/serverError.helper.js";
import messageRepository from "../repositories/message.repository.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";

class MessageService {
    async create(channel_id, user_id, contenido) {
        return await messageRepository.create(contenido, channel_id, user_id);
    }

    async getAllByChannel(channel_id, page, limit) {
        const page_num = Math.max(1, parseInt(page) || 1);
        const limit_num = Math.min(100, Math.max(1, parseInt(limit) || 20));

        return await messageRepository.getByChannelId(channel_id, page_num, limit_num);
    }

    async updateById(channel_id, message_id, user_id, membership, contenido) {
        await this.#getEditableMessage(channel_id, message_id, user_id, membership, "editar");
        return await messageRepository.updateById(message_id, { contenido });
    }

    async deleteById(channel_id, message_id, user_id, membership) {
        await this.#getEditableMessage(channel_id, message_id, user_id, membership, "eliminar");
        return await messageRepository.softDeleteById(message_id);
    }

    //valida que el mensaje exista, pertenezca al canal y que el usuario sea el autor o admin/dueño
    async #getEditableMessage(channel_id, message_id, user_id, membership, accion) {
        const message = await messageRepository.getById(message_id);

        if (!message || !message.estado) {
            throw new ServerError("Mensaje no encontrado", 404);
        }
        if (message.fk_channel_id.toString() !== channel_id) {
            throw new ServerError("El mensaje no pertenece a este canal", 403);
        }

        const is_author = message.fk_user_id._id.toString() === user_id;
        const is_admin = [MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN].includes(membership.rol);

        if (!is_author && !is_admin) {
            throw new ServerError(`No tienes permiso para ${accion} este mensaje`, 403);
        }

        return message;
    }
}

const messageService = new MessageService();
export default messageService;

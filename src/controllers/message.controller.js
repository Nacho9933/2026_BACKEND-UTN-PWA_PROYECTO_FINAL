import ServerError from "../helpers/serverError.helper.js";
import messageRepository from "../repositories/message.repository.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";

class MessageController {
    async create(request, response) {
        const { contenido } = request.body;
        const { workspace_id, channel_id } = request.params;
        const user_id = request.user.id;

        const new_message = await messageRepository.create(
            contenido,
            channel_id,
            user_id
        );

        return response.status(201).json({
            ok: true,
            status: 201,
            message: "Mensaje creado con éxito",
            data: {
                message: new_message
            }
        });
    }

    async getAllByChannel(request, response) {
        const { channel_id } = request.params;
        const { page = 1, limit = 20 } = request.query;

        const page_num = Math.max(1, parseInt(page) || 1);
        const limit_num = Math.min(100, Math.max(1, parseInt(limit) || 20));

        const result = await messageRepository.getByChannelId(channel_id, page_num, limit_num);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Mensajes obtenidos con éxito",
            data: result
        });
    }

    async updateById(request, response) {
        const { channel_id, message_id } = request.params;
        const { contenido } = request.body;
        const user_id = request.user.id;
        const membership = request.membership;

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
            throw new ServerError("No tienes permiso para editar este mensaje", 403);
        }

        const updated_message = await messageRepository.updateById(message_id, { contenido });

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
        const { channel_id, message_id } = request.params;
        const user_id = request.user.id;
        const membership = request.membership;

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
            throw new ServerError("No tienes permiso para eliminar este mensaje", 403);
        }

        const deleted_message = await messageRepository.softDeleteById(message_id);

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

const messageController = new MessageController();
export default messageController;

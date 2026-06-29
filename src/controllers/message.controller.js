import messageService from "../services/message.service.js";

class MessageController {
    async create(request, response) {
        const { contenido } = request.body;
        const { channel_id } = request.params;
        const user_id = request.user.id;

        const new_message = await messageService.create(channel_id, user_id, contenido);

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
        const { page, limit } = request.query;

        const result = await messageService.getAllByChannel(channel_id, page, limit);

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

        const updated_message = await messageService.updateById(
            channel_id,
            message_id,
            request.user.id,
            request.membership,
            contenido
        );

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

        const deleted_message = await messageService.deleteById(
            channel_id,
            message_id,
            request.user.id,
            request.membership
        );

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

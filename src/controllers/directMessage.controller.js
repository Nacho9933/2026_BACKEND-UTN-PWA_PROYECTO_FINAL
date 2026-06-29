import directMessageService from "../services/directMessage.service.js";

class DirectMessageController {
    async getConversations(request, response) {
        const conversations = await directMessageService.getConversations(request.user.id);

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
        const { user_id: other_user_id } = request.params;
        const { page, limit } = request.query;

        const result = await directMessageService.getConversation(
            request.user.id,
            other_user_id,
            page,
            limit
        );

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Conversación obtenida con éxito",
            data: result
        });
    }

    async send(request, response) {
        const { user_id: receiver_id } = request.params;
        const { contenido } = request.body;

        const new_message = await directMessageService.send(request.user.id, receiver_id, contenido);

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
        const { message_id } = request.params;
        const { contenido } = request.body;

        const updated_message = await directMessageService.updateById(request.user.id, message_id, contenido);

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
        const { message_id } = request.params;

        const deleted_message = await directMessageService.deleteById(request.user.id, message_id);

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

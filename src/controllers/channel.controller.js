import channelService from "../services/channel.service.js";

class ChannelController {
    async create(request, response) {
        const { nombre, descripcion } = request.body;
        const { workspace_id } = request.params;

        const new_channel = await channelService.create(workspace_id, nombre, descripcion);

        return response.status(201).json({
            ok: true,
            status: 201,
            message: "Canal creado con éxito",
            data: {
                channel: new_channel
            }
        });
    }

    async getAllByWorkspace(request, response) {
        const channels = await channelService.getAllByWorkspace(request.params.workspace_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Canales obtenidos con éxito",
            data: {
                channels
            }
        });
    }

    async getById(request, response) {
        const { workspace_id, channel_id } = request.params;

        const channel = await channelService.getById(workspace_id, channel_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Canal obtenido con éxito",
            data: {
                channel
            }
        });
    }

    async updateById(request, response) {
        const { workspace_id, channel_id } = request.params;

        const updated_channel = await channelService.updateById(workspace_id, channel_id, request.body);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Canal actualizado con éxito",
            data: {
                channel: updated_channel
            }
        });
    }

    async deleteById(request, response) {
        const { workspace_id, channel_id } = request.params;

        const deleted_channel = await channelService.deleteById(workspace_id, channel_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Canal eliminado con éxito",
            data: {
                channel: deleted_channel
            }
        });
    }
}

const channelController = new ChannelController();
export default channelController;

import ServerError from "../helpers/serverError.helper.js";
import channelRepository from "../repositories/channel.repository.js";

class ChannelController {
    async create(request, response) {
        const { nombre, descripcion } = request.body;
        const { workspace_id } = request.params;

        if (!nombre || nombre.trim() === '') {
            throw new ServerError("El nombre del canal es obligatorio", 400);
        }

        const new_channel = await channelRepository.create(
            nombre,
            descripcion || '',
            workspace_id
        );

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
        const { workspace_id } = request.params;

        const channels = await channelRepository.getByWorkspaceId(workspace_id);

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

        const channel = await channelRepository.getById(channel_id);
        if (!channel || !channel.estado || channel.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Canal no encontrado en este espacio de trabajo", 404);
        }

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
        const { nombre, descripcion } = request.body;

        const channel = await channelRepository.getById(channel_id);
        if (!channel || !channel.estado || channel.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Canal no encontrado en este espacio de trabajo", 404);
        }

        const update_data = {};

        if (!nombre && !descripcion) {
            throw new ServerError("Debes enviar al menos un campo para actualizar", 400);
        }
        if (nombre) {
            if (nombre.length < 2) {
                throw new ServerError("El nombre debe tener al menos 2 caracteres", 400);
            }
            update_data.nombre = nombre;
        }
        if (descripcion) {
            update_data.descripcion = descripcion;
        }

        const updated_channel = await channelRepository.updateById(channel_id, update_data);

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

        const channel = await channelRepository.getById(channel_id);
        if (!channel || !channel.estado || channel.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Canal no encontrado en este espacio de trabajo", 404);
        }

        const deleted_channel = await channelRepository.softDeleteById(channel_id);

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

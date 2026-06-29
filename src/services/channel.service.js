import ServerError from "../helpers/serverError.helper.js";
import channelRepository from "../repositories/channel.repository.js";

class ChannelService {
    async create(workspace_id, nombre, descripcion) {
        return await channelRepository.create(nombre, descripcion || '', workspace_id);
    }

    async getAllByWorkspace(workspace_id) {
        return await channelRepository.getByWorkspaceId(workspace_id);
    }

    async getById(workspace_id, channel_id) {
        const channel = await channelRepository.getById(channel_id);
        if (!channel || !channel.estado || channel.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Canal no encontrado en este espacio de trabajo", 404);
        }
        return channel;
    }

    async updateById(workspace_id, channel_id, { nombre, descripcion }) {
        //valida que el canal exista y pertenezca al espacio de trabajo
        await this.getById(workspace_id, channel_id);

        const update_data = {};
        if (nombre !== undefined) {
            update_data.nombre = nombre;
        }
        if (descripcion !== undefined) {
            update_data.descripcion = descripcion;
        }

        return await channelRepository.updateById(channel_id, update_data);
    }

    async deleteById(workspace_id, channel_id) {
        await this.getById(workspace_id, channel_id);
        return await channelRepository.softDeleteById(channel_id);
    }
}

const channelService = new ChannelService();
export default channelService;

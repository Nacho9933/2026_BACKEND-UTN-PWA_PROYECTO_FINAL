import Channel from "../models/channel.model.js";

class ChannelRepository {
    async getByWorkspaceId(workspace_id) {
        //Lista de canales activos de un espacio de trabajo
        return await Channel.find({ fk_workspace_id: workspace_id, estado: true });
    }

    async getById(channel_id) {
        return await Channel.findById(channel_id);
    }

    async create(nombre, descripcion, workspace_id) {
        return await Channel.create({
            nombre,
            descripcion,
            fk_workspace_id: workspace_id
        });
    }

    async updateById(channel_id, update_data) {
        return await Channel.findByIdAndUpdate(channel_id, update_data, { new: true });
    }

    async softDeleteById(channel_id) {
        return await Channel.findByIdAndUpdate(channel_id, { estado: false }, { new: true });
    }
}

const channelRepository = new ChannelRepository();
export default channelRepository;

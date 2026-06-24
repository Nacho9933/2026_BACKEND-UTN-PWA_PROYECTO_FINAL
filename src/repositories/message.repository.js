import Message from "../models/message.model.js";

class MessageRepository {
    async getByChannelId(channel_id, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const messages = await Message
            .find({ fk_channel_id: channel_id, estado: true })
            .populate('fk_user_id', 'nombre email')
            .sort({ fecha_creacion: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({ fk_channel_id: channel_id, estado: true });

        return {
            //traemos los más nuevos con el sort desc y los damos vuelta para devolverlos en orden cronológico
            messages: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getById(message_id) {
        return await Message.findById(message_id).populate('fk_user_id', 'nombre email');
    }

    async create(contenido, channel_id, user_id) {
        return await Message.create({
            contenido,
            fk_channel_id: channel_id,
            fk_user_id: user_id
        });
    }

    async updateById(message_id, update_data) {
        return await Message.findByIdAndUpdate(message_id, update_data, { new: true }).populate('fk_user_id', 'nombre email');
    }

    async softDeleteById(message_id) {
        return await Message.findByIdAndUpdate(message_id, { estado: false }, { new: true });
    }
}

const messageRepository = new MessageRepository();
export default messageRepository;

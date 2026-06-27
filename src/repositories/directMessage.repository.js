import mongoose from "mongoose";
import DirectMessage from "../models/directMessage.model.js";

class DirectMessageRepository {
    //trae la conversación entre dos usuarios (en ambos sentidos), paginada y en orden cronológico
    async getConversation(user_a_id, user_b_id, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const filter = {
            estado: true,
            $or: [
                { fk_sender_id: user_a_id, fk_receiver_id: user_b_id },
                { fk_sender_id: user_b_id, fk_receiver_id: user_a_id }
            ]
        };

        const messages = await DirectMessage
            .find(filter)
            .populate('fk_sender_id', 'nombre email')
            .sort({ fecha_creacion: -1 })
            .skip(skip)
            .limit(limit);

        const total = await DirectMessage.countDocuments(filter);

        return {
            messages: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    //lista las conversaciones del usuario: un item por cada persona con la que habló, con el último mensaje
    async getConversationsForUser(user_id) {
        const userObjectId = new mongoose.Types.ObjectId(user_id);

        return await DirectMessage.aggregate([
            {
                $match: {
                    estado: true,
                    $or: [
                        { fk_sender_id: userObjectId },
                        { fk_receiver_id: userObjectId }
                    ]
                }
            },
            { $sort: { fecha_creacion: -1 } },
            {
                $group: {
                    //agrupamos por el "otro" usuario de la conversación
                    _id: {
                        $cond: [
                            { $eq: ["$fk_sender_id", userObjectId] },
                            "$fk_receiver_id",
                            "$fk_sender_id"
                        ]
                    },
                    ultimo_mensaje: { $first: "$contenido" },
                    fecha_ultimo_mensaje: { $first: "$fecha_creacion" }
                }
            },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
            { $unwind: '$usuario' },
            {
                $project: {
                    _id: 0,
                    usuario: {
                        _id: '$usuario._id',
                        nombre: '$usuario.nombre',
                        email: '$usuario.email'
                    },
                    ultimo_mensaje: 1,
                    fecha_ultimo_mensaje: 1
                }
            },
            { $sort: { fecha_ultimo_mensaje: -1 } }
        ]);
    }

    async getById(message_id) {
        return await DirectMessage.findById(message_id).populate('fk_sender_id', 'nombre email');
    }

    async create(contenido, sender_id, receiver_id) {
        return await DirectMessage.create({
            contenido,
            fk_sender_id: sender_id,
            fk_receiver_id: receiver_id
        });
    }

    async updateById(message_id, update_data) {
        return await DirectMessage.findByIdAndUpdate(message_id, update_data, { new: true }).populate('fk_sender_id', 'nombre email');
    }

    async softDeleteById(message_id) {
        return await DirectMessage.findByIdAndUpdate(message_id, { estado: false }, { new: true });
    }
}

const directMessageRepository = new DirectMessageRepository();
export default directMessageRepository;

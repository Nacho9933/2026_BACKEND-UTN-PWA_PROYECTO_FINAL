import express from 'express';

import directMessageController from '../controllers/directMessage.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { sendDirectMessageSchema, updateDirectMessageSchema } from '../schemas/directMessage.schema.js';

const directMessageRouter = express.Router();

//todas las rutas de mensajes directos requieren login
directMessageRouter.use(authMiddleware);

//va antes de /:user_id para que no lo capture como un id
directMessageRouter.get(
    '/conversations',
    directMessageController.getConversations
);

directMessageRouter.get(
    '/:user_id',
    directMessageController.getConversation
);

directMessageRouter.post(
    '/:user_id',
    validate(sendDirectMessageSchema),
    directMessageController.send
);

directMessageRouter.put(
    '/:message_id',
    validate(updateDirectMessageSchema),
    directMessageController.updateById
);

directMessageRouter.delete(
    '/:message_id',
    directMessageController.deleteById
);

export default directMessageRouter;

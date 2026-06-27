import express from 'express';

import messageController from '../controllers/message.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createMessageSchema, updateMessageSchema } from '../schemas/message.schema.js';

const messageRouter = express.Router({ mergeParams: true });

messageRouter.post(
    '/',
    workspaceMiddleware([]),
    validate(createMessageSchema),
    messageController.create
);

messageRouter.get(
    '/',
    workspaceMiddleware([]),
    messageController.getAllByChannel
);

messageRouter.put(
    '/:message_id',
    workspaceMiddleware([]),
    validate(updateMessageSchema),
    messageController.updateById
);

messageRouter.delete(
    '/:message_id',
    workspaceMiddleware([]),
    messageController.deleteById
);

export default messageRouter;

import express from 'express';

import messageController from '../controllers/message.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';

const messageRouter = express.Router({ mergeParams: true });

messageRouter.post(
    '/',
    workspaceMiddleware([]),
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
    messageController.updateById
);

messageRouter.delete(
    '/:message_id',
    workspaceMiddleware([]),
    messageController.deleteById
);

export default messageRouter;

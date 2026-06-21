import express from 'express';

import messageController from '../controllers/message.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';

const messageRouter = express.Router({ mergeParams: true });

//Crear y listar: cualquier miembro del espacio de trabajo
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

//Editar: solo el autor o admin
messageRouter.put(
    '/:message_id',
    workspaceMiddleware([]),
    messageController.updateById
);

//Eliminar: solo el autor o admin
messageRouter.delete(
    '/:message_id',
    workspaceMiddleware([]),
    messageController.deleteById
);

export default messageRouter;

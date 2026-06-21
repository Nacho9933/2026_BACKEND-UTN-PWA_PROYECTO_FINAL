import express from 'express';

import channelController from '../controllers/channel.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';
import messageRouter from './message.router.js';

//mergeParams permite acceder al :workspace_id del router padre
const channelRouter = express.Router({ mergeParams: true });

//Crear y listar: cualquier miembro del espacio de trabajo
channelRouter.post(
    '/',
    workspaceMiddleware([]),
    channelController.create
);

channelRouter.get(
    '/',
    workspaceMiddleware([]),
    channelController.getAllByWorkspace
);

//Editar y eliminar: solo owner o admin
channelRouter.put(
    '/:channel_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    channelController.updateById
);

channelRouter.delete(
    '/:channel_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    channelController.deleteById
);

//Todo lo relacionado a mensajes: /api/workspace/:workspace_id/channels/:channel_id/messages
channelRouter.use('/:channel_id/messages', messageRouter);

export default channelRouter;

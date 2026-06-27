import express from 'express';

import channelController from '../controllers/channel.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';
import messageRouter from './message.router.js';
import validate from '../middlewares/validate.middleware.js';
import { createChannelSchema, updateChannelSchema } from '../schemas/channel.schema.js';

const channelRouter = express.Router({ mergeParams: true });

channelRouter.post(
    '/',
    workspaceMiddleware([]),
    validate(createChannelSchema),
    channelController.create
);

channelRouter.get(
    '/',
    workspaceMiddleware([]),
    channelController.getAllByWorkspace
);

channelRouter.get(
    '/:channel_id',
    workspaceMiddleware([]),
    channelController.getById
);

channelRouter.put(
    '/:channel_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    validate(updateChannelSchema),
    channelController.updateById
);

channelRouter.delete(
    '/:channel_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    channelController.deleteById
);

channelRouter.use('/:channel_id/messages', messageRouter);

export default channelRouter;

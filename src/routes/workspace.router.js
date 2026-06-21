import express from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import workspaceController from '../controllers/workspace.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';
import memberWorkspaceController from '../controllers/memberWorkspace.controller.js';
import channelRouter from './channel.router.js';

const workspaceRouter = express.Router();

//Lo pongo arriba ya que no quiero que este alcanzado por el auth middleware
workspaceRouter.get(
    '/:workspace_id/members/:decision',
    memberWorkspaceController.processInvitation
);

//Configuramos el authMiddleware a nivel de ruta
workspaceRouter.use(authMiddleware);

workspaceRouter.post('/', workspaceController.create);

workspaceRouter.get('/', workspaceController.getAllByUser);

workspaceRouter.delete(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]), 
    workspaceController.deleteById
)

workspaceRouter.put(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.OWNER]), 
    workspaceController.updateById
)

workspaceRouter.post(
    '/:workspace_id/members',
    authMiddleware,
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    memberWorkspaceController.inviteUser
);

workspaceRouter.get(
    '/:workspace_id/members',
    workspaceMiddleware([]),
    memberWorkspaceController.getWorkspaceMembers
);

workspaceRouter.put(
    '/:workspace_id/members/:member_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    memberWorkspaceController.updateMemberRole
);

workspaceRouter.delete(
    '/:workspace_id/members/:member_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    memberWorkspaceController.removeMember
);

//Todo lo relacionado a canales: /api/workspace/:workspace_id/channels
workspaceRouter.use('/:workspace_id/channels', channelRouter);


export default workspaceRouter;
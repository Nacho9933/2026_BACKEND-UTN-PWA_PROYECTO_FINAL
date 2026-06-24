import express from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import workspaceController from '../controllers/workspace.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';
import memberWorkspaceController from '../controllers/memberWorkspace.controller.js';
import channelRouter from './channel.router.js';

const workspaceRouter = express.Router();

//va antes del authMiddleware: se accede desde el link del mail, sin sesión iniciada
workspaceRouter.get(
    '/:workspace_id/members/:decision',
    memberWorkspaceController.processInvitation
);

//de acá en adelante todas las rutas requieren login
workspaceRouter.use(authMiddleware);

workspaceRouter.post('/', workspaceController.create);

workspaceRouter.get('/', workspaceController.getAllByUser);

workspaceRouter.get(
    '/:workspace_id',
    workspaceMiddleware([]),
    workspaceController.getById
);

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

workspaceRouter.use('/:workspace_id/channels', channelRouter);

export default workspaceRouter;
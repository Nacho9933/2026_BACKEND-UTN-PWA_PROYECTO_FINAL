import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";

class WorkspaceService {
    async create(user_id, nombre, descripcion) {
        const newWorkspace = await workspaceRepository.create(nombre, descripcion || '');

        //el creador queda como dueño con la invitación ya aceptada
        await workspaceMemberRepository.create(
            user_id,
            newWorkspace._id,
            MEMBER_WORKSPACE_ROLES.OWNER,
            MEMBER_INVITATION_STATUS.ACCEPTED,
            null
        );

        return newWorkspace;
    }

    async getById(workspace_id) {
        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("Espacio de trabajo no encontrado", 404);
        }
        return workspace;
    }

    async getAllByUser(user_id) {
        return await workspaceMemberRepository.getByUserId(user_id);
    }

    async deleteById(workspace_id) {
        return await workspaceRepository.softDeleteById(workspace_id);
    }

    async updateById(workspace_id, { nombre, descripcion }) {
        const update_data = {};
        if (nombre !== undefined) {
            update_data.nombre = nombre;
        }
        if (descripcion !== undefined) {
            update_data.descripcion = descripcion;
        }

        await workspaceRepository.updateById(workspace_id, update_data);
        return await workspaceRepository.getById(workspace_id);
    }
}

const workspaceService = new WorkspaceService();
export default workspaceService;

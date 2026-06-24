import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import memberWorkspaceService from "../services/memberWorkspace.service.js";

class MemberWorkspaceController {
    async inviteUser(request, response) {
            const { workspace_id } = request.params;
            const { invited_email, role } = request.body;
            const { id: client_id } = request.user;

            
            if (!invited_email || !role) {
                throw new ServerError("Faltan datos obligatorios (email y rol)", 400);
            }

            await memberWorkspaceService.inviteUser(
                client_id,
                invited_email,
                workspace_id,
                role
            )

            return response.status(200).json({ 
                ok: true, 
                message: "Invitación enviada con éxito" 
            });

       
    }

    async getWorkspaceMembers(request, response) {
        const { workspace_id } = request.params;

        const members = await workspaceMemberRepository.getByWorkspaceId(workspace_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Miembros obtenidos con éxito",
            data: {
                members
            }
        });
    }

    async updateMemberRole(request, response) {
        const { workspace_id, member_id } = request.params;
        const { role } = request.body;

        if (!role) {
            throw new ServerError("El rol es obligatorio", 400);
        }

        //no se puede asignar dueño: la propiedad no se transfiere por acá
        const valid_roles = [MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.USER];
        if (!valid_roles.includes(role)) {
            throw new ServerError("Rol inválido", 400);
        }

        const member = await workspaceMemberRepository.getById(member_id);
        if (!member || member.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Miembro no encontrado en este espacio de trabajo", 404);
        }

        if (member.rol === MEMBER_WORKSPACE_ROLES.OWNER) {
            throw new ServerError("No se puede modificar el rol del dueño del espacio de trabajo", 403);
        }

        const updated_member = await workspaceMemberRepository.updateById(member_id, { rol: role });

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Rol del miembro actualizado con éxito",
            data: {
                member: updated_member
            }
        });
    }

    async removeMember(request, response) {
        const { workspace_id, member_id } = request.params;

        const member = await workspaceMemberRepository.getById(member_id);
        if (!member || member.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Miembro no encontrado en este espacio de trabajo", 404);
        }

        if (member.rol === MEMBER_WORKSPACE_ROLES.OWNER) {
            throw new ServerError("No se puede expulsar al dueño del espacio de trabajo", 403);
        }

        await workspaceMemberRepository.deleteById(member_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Miembro expulsado con éxito"
        });
    }

     async processInvitation(request, response) {
       
            const { decision } = request.params;
            const { invitation_token } = request.query;

            if (!invitation_token) throw new ServerError("Falta token de invitacion", 400);
            if (decision !== MEMBER_INVITATION_STATUS.ACCEPTED && decision !== MEMBER_INVITATION_STATUS.REJECTED){
                throw new ServerError("Decisión no válida", 400);
            }
            await memberWorkspaceService.memberDesicion(invitation_token, decision)
            
            response.json({
                ok: true,
                status: 200,
                message: `Decision de ${decision} tomada con exito!`
            })

        
    }
}

const memberWorkspaceController = new MemberWorkspaceController()
export default memberWorkspaceController
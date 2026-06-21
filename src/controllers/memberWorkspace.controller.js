import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import memberWorkspaceService from "../services/memberWorkspace.service.js";
import jwt from 'jsonwebtoken'

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
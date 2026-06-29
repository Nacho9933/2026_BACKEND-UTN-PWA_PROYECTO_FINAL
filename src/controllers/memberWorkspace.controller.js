import memberWorkspaceService from "../services/memberWorkspace.service.js";

class MemberWorkspaceController {
    async inviteUser(request, response) {
        const { workspace_id } = request.params;
        const { invited_email, role } = request.body;
        const { id: client_id } = request.user;

        await memberWorkspaceService.inviteUser(client_id, invited_email, workspace_id, role);

        return response.status(200).json({
            ok: true,
            message: "Invitación enviada con éxito"
        });
    }

    async getWorkspaceMembers(request, response) {
        const members = await memberWorkspaceService.getWorkspaceMembers(request.params.workspace_id);

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

        const updated_member = await memberWorkspaceService.updateMemberRole(workspace_id, member_id, role);

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

        await memberWorkspaceService.removeMember(workspace_id, member_id);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Miembro expulsado con éxito"
        });
    }

    async processInvitation(request, response) {
        const { decision } = request.params;
        const { invitation_token } = request.query;

        await memberWorkspaceService.memberDesicion(invitation_token, decision);

        return response.status(200).json({
            ok: true,
            status: 200,
            message: `Decision de ${decision} tomada con exito!`
        });
    }
}

const memberWorkspaceController = new MemberWorkspaceController();
export default memberWorkspaceController;

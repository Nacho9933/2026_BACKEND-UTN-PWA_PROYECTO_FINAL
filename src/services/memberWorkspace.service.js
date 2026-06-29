import ENVIRONMENT from "../config/environment.config.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import jwt from 'jsonwebtoken'
import mailService from "./mail.service.js";

const WORKSPACE_CONFIG = {
    INVITATION_MEMBERSHIP_EXPIRATION_DAYS: 30
}

class MemberWorkspaceService {

    async inviteUser(user_invited_for_id, user_invited_email, workspace_id, role) {

        const userToInvite = await userRepository.getByEmail(user_invited_email);
        if (!userToInvite) {
            throw new ServerError("El usuario ingresado no existe en el sistema", 404);
        }

        await this.verifyAlreadyMember(workspace_id, userToInvite._id)


        const member_created = await this.createMember(
            userToInvite._id,
            workspace_id,
            role
        )

        const invitation_token = jwt.sign(
            {
                member_id: member_created._id
            },
            ENVIRONMENT.JWT_SECRET,
            {
                expiresIn: `${WORKSPACE_CONFIG.INVITATION_MEMBERSHIP_EXPIRATION_DAYS}d`
            }
        );

        const accept_url = `${ENVIRONMENT.URL_BACKEND}/api/workspace/${workspace_id}/members/${MEMBER_INVITATION_STATUS.ACCEPTED}?invitation_token=${invitation_token}`;
        const reject_url = `${ENVIRONMENT.URL_BACKEND}/api/workspace/${workspace_id}/members/${MEMBER_INVITATION_STATUS.REJECTED}?invitation_token=${invitation_token}`;



        await mailService.sendInvitationMemberEmail(userToInvite.email, accept_url, reject_url, role)
    }

    async getWorkspaceMembers(workspace_id) {
        return await workspaceMemberRepository.getByWorkspaceId(workspace_id);
    }

    async updateMemberRole(workspace_id, member_id, role) {
        const member = await this.getMemberInWorkspace(workspace_id, member_id);

        if (member.rol === MEMBER_WORKSPACE_ROLES.OWNER) {
            throw new ServerError("No se puede modificar el rol del dueño del espacio de trabajo", 403);
        }

        return await workspaceMemberRepository.updateById(member_id, { rol: role });
    }

    async removeMember(workspace_id, member_id) {
        const member = await this.getMemberInWorkspace(workspace_id, member_id);

        if (member.rol === MEMBER_WORKSPACE_ROLES.OWNER) {
            throw new ServerError("No se puede expulsar al dueño del espacio de trabajo", 403);
        }

        await workspaceMemberRepository.deleteById(member_id);
    }

    async getMemberInWorkspace(workspace_id, member_id) {
        const member = await workspaceMemberRepository.getById(member_id);
        if (!member || member.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Miembro no encontrado en este espacio de trabajo", 404);
        }
        return member;
    }

    async memberDesicion(invitation_token, decision) {
        if (!invitation_token) {
            throw new ServerError("Falta token de invitacion", 400);
        }
        if (decision !== MEMBER_INVITATION_STATUS.ACCEPTED && decision !== MEMBER_INVITATION_STATUS.REJECTED) {
            throw new ServerError("Decisión no válida", 400);
        }

        const decoded = jwt.verify(invitation_token, ENVIRONMENT.JWT_SECRET);

        const member_created = await workspaceMemberRepository.getById(decoded.member_id);
        if (!member_created) {
            throw new ServerError("Invitación no encontrada o expirada", 404);
        }

        if (member_created.estatus_invitacion !== MEMBER_INVITATION_STATUS.PENDING) {
            throw new ServerError("Esta invitación ya fue procesada anteriormente", 400);
        }

        if (member_created.fecha_expiracion_invitacion < new Date()) {
            throw new ServerError("Esta invitación ha expirado", 400);
        }

        if (decision === MEMBER_INVITATION_STATUS.ACCEPTED) {
            await workspaceMemberRepository.updateById(
                member_created._id,
                { estatus_invitacion: MEMBER_INVITATION_STATUS.ACCEPTED }
            );
        }

        if (decision === MEMBER_INVITATION_STATUS.REJECTED) {
            await workspaceMemberRepository.updateById(
                member_created._id,
                { estatus_invitacion: MEMBER_INVITATION_STATUS.REJECTED }
            );

        }
    }

    async verifyAlreadyMember(workspace_id, user_id) {
        const isInvitedAlreadyMember = await workspaceMemberRepository.getMemberByWorkspaceAndUserId(workspace_id, user_id);
        if (isInvitedAlreadyMember) {
            if (isInvitedAlreadyMember.estatus_invitacion === MEMBER_INVITATION_STATUS.ACCEPTED) {
                throw new ServerError("El usuario ya es un miembro del espacio de trabajo", 400);
            }

            const ahora = new Date();
            //si hay una invitación pendiente vigente avisamos; si ya expiró la borramos para poder reinvitar
            if (isInvitedAlreadyMember.estatus_invitacion === MEMBER_INVITATION_STATUS.PENDING) {

                if (isInvitedAlreadyMember.fecha_expiracion_invitacion > ahora) {
                    throw new ServerError("Ya has enviado una invitacion al usuario", 400);
                }
                else {
                    workspaceMemberRepository.deleteById(isInvitedAlreadyMember._id)
                }
            }
            if (isInvitedAlreadyMember.estatus_invitacion === MEMBER_INVITATION_STATUS.REJECTED) {
                throw new ServerError("El usuario ha rechazado la invitacion", 400);
            }
        }
    }

    async createMember(user_id, workspace_id, rol) {

        const expiration_date = this.getMembershipExpirationDate()
        const new_member = await workspaceMemberRepository.create(
            user_id,
            workspace_id,
            rol,
            MEMBER_INVITATION_STATUS.PENDING,
            expiration_date
        );
        return new_member


    }

    getMembershipExpirationDate() {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + WORKSPACE_CONFIG.INVITATION_MEMBERSHIP_EXPIRATION_DAYS);
        return expirationDate
    }



}


const memberWorkspaceService = new MemberWorkspaceService();
export default memberWorkspaceService
import ENVIRONMENT from "../config/environment.config.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import jwt from 'jsonwebtoken'
import mailService from "./mail.service.js";

const WORKSPACE_CONFIG = {
    INVITATION_MEMBERSHIP_EXPIRATION_DAYS: 30
}

/* 
Es la capa de nuestra API encargada de la logica de negocio
La idea es separar las funcionalidades de nuestra aplicacion como servicios, de esta manera el controlador solo se ocupara de parte HTTP Request response y el servicio de la logica de negocio
*/
class MemberWorkspaceService {

    /**
     * 
     * @param {String} user_invited_for_id El id del usuario que invita
     * @param {String} user_invited_email El email del usuario invitado
     * @param {String} workspace_id El id del espacio de trabajo a invitar
     * @param {String} role El rol del usuario invitado
     * 
     * */
    async inviteUser(user_invited_for_id, user_invited_email, workspace_id, role) {

        const userToInvite = await userRepository.getByEmail(user_invited_email);
        if (!userToInvite) {
            throw new ServerError("El usuario ingresado no existe en el sistema", 404);
        }

        //Aca se decide que pasa si ya es miembro
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

    async memberDesicion(invitation_token, decision) {
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
            //Si el usuario ya esta invitado y es pendiente y su fecha de expiracion ya paso, eliminamos membresia y volvemos a crear. Sino lanzamos error
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
        //Calculamos una fecha de expiracion para la invitacion del miembro
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + WORKSPACE_CONFIG.INVITATION_MEMBERSHIP_EXPIRATION_DAYS);
        return expirationDate
    }



}


const memberWorkspaceService = new MemberWorkspaceService();
export default memberWorkspaceService
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js"
import WorkspaceMember from "../models/workspaceMembers.model.js"

class WorkspaceMemberRepository {

    //Busca una membresia en particular
    async getByUserAndWorkspaceId(user_id, workspace_id, estatus_invitacion = MEMBER_INVITATION_STATUS.ACCEPTED){
        const membership = await WorkspaceMember.findOne({
            fk_user_id: user_id,
            fk_workspace_id: workspace_id,
            estatus_invitacion
        })
        return membership
    }

    /* Desarrollar los metodos */
    async create(user_id, workspace_id, rol, estatus_invitacion, fecha_expiracion_invitacion) {
        return await WorkspaceMember.create({
            fk_workspace_id: workspace_id,
            fk_user_id: user_id,
            rol: rol,
            estatus_invitacion,
            fecha_expiracion_invitacion
        })
    }

    async getById(member_id) {
        return await WorkspaceMember.findById(member_id)
    }

    async updateById(member_id, update_data) {
        return await WorkspaceMember.findByIdAndUpdate(member_id, update_data, { new: true })
    }

    async deleteById(member_id) {
        return await WorkspaceMember.findByIdAndDelete(member_id)
    }

    /* HASTA AQUI */

    async getByWorkspaceId(workspace_id) {
        //Lista de membresias por x espacio de trabajo
        const result = await WorkspaceMember
            .find({ 
                fk_workspace_id: workspace_id, 
                estatus_invitacion: MEMBER_INVITATION_STATUS.ACCEPTED
            })
            //Populate sirve para poder expandir una cierta propiedad
            //Cuando expandimos basicamente estamos trayendo los datos referenciados a esa propiedad
            //Solo podemos expandir las propiedades que en el modelo fueron marcadas como referencias
            .populate(
                'fk_user_id', 'nombre email'
            )

        const members_mapped = result.map(
            (member) => new MemberWorkspaceWithUserInfo(member)
        )
        return members_mapped
    }

    /* async getByUserId(user_id) {
        //Lista de membresias por x usuario, saber a que espacios de trabajo pertenece un usuario
    } */

    async getByUserId(user_id) {
        const memberships = await WorkspaceMember
            .find({ fk_user_id: user_id, estatus_invitacion: MEMBER_INVITATION_STATUS.ACCEPTED })
            //Por cada membresia quiero expandir la propiedad 'fk_workspace_id' trayendo asi el nombre, descripcion y el estado asociados al espacio de trabajo
            .populate(
                {
                    path:  'fk_workspace_id', //Propiedad a expandir
                    select: 'nombre descripcion estado', //Propiedades que seleccionamos del dato expandido
                    match: {estado: true} //Condicion
                }
            );

        return memberships
            .filter(
                membership => membership.fk_workspace_id
            )
            .map(membership => ({
                member_id: membership._id,
                member_rol: membership.rol,
                member_fecha_union: membership.fecha_creacion,
                workspace_id: membership.fk_workspace_id._id,
                workspace_nombre: membership.fk_workspace_id.nombre,
                workspace_descripcion: membership.fk_workspace_id.descripcion
            }));
    }

     async getMemberByWorkspaceAndUserId(workspace_id, user_id) {
        return await WorkspaceMember.findOne({
            fk_workspace_id: workspace_id,
            fk_user_id: user_id
        });
    }


}

const workspaceMemberRepository = new WorkspaceMemberRepository()

export default workspaceMemberRepository


class MemberWorkspaceWithUserInfo {
    constructor(raw_member) {
        this.member_id = raw_member._id
        this.member_rol = raw_member.rol
        this.member_fecha_creacion = raw_member.fecha_creacion
        this.user_id = raw_member.fk_user_id._id
        this.user_nombre = raw_member.fk_user_id.nombre
        this.user_email = raw_member.fk_user_id.email
    }
}
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";


class WorkspaceController {
    async create(request, response) {

        const { nombre, descripcion } = request.body;
        const user_id = request.user.id;

        if (!nombre || nombre.trim() === '') {
            throw new ServerError("El nombre del espacio de trabajo es obligatorio", 400);
        }

        const newWorkspace = await workspaceRepository.create(
            nombre,
            descripcion || ''
        );

        //el creador queda como dueño con la invitación ya aceptada
        await workspaceMemberRepository.create(
            user_id,
            newWorkspace._id,
            MEMBER_WORKSPACE_ROLES.OWNER,
            MEMBER_INVITATION_STATUS.ACCEPTED,
            null
        );

        return response.status(201).json({
            ok: true,
            message: "Espacio de trabajo creado con éxito",
            data: {
                workspace: newWorkspace
            }
        });


    }

    async getById(request, response) {
        const workspace_id = request.params.workspace_id

        const workspace = await workspaceRepository.getById(workspace_id)
        if (!workspace || !workspace.estado) {
            throw new ServerError("Espacio de trabajo no encontrado", 404)
        }

        //devolvemos la membresía (la deja el workspaceMiddleware) para que el front sepa qué acciones habilitar
        return response.status(200).json({
            ok: true,
            status: 200,
            message: "Espacio de trabajo obtenido",
            data: {
                workspace,
                membership: {
                    member_id: request.membership._id,
                    rol: request.membership.rol
                }
            }
        })
    }

    async getAllByUser(req, res) {

        const user_id = req.user.id;

        const workspaces = await workspaceMemberRepository.getByUserId(user_id);

        return res.status(200).json({
            ok: true,
            message: "Espacios de trabajo obtenidos",
            data: {
                workspaces
            }
        });

    }

    async deleteById(request, response) {

        const workspace_id = request.params.workspace_id

        const deleted_workspace = await workspaceRepository.softDeleteById(workspace_id)

        return response.status(200).json({
            message: "Espacio de trabajo eliminado exitosamente",
            ok: true,
            status: 200,
            data: {
                workspace: deleted_workspace
            }
        });


    }
    async updateById(request, response) {

        const workspace_id = request.params.workspace_id
        const { nombre, descripcion } = request.body

        const updated_info = {}

        if (!nombre && !descripcion) {
            throw new ServerError("Debes enviar al menos un campo para actualizar", 400)
        }
        if (nombre) {
            if (nombre.length < 2) {
                throw new ServerError("El nombre debe tener al menos 2 caracteres", 400)
            }
            updated_info.nombre = nombre
        }

        if (descripcion) {
            updated_info.descripcion = descripcion
        }
        const updated_workspace = await workspaceRepository.updateById(workspace_id, updated_info)

        const workspace_after_update = await workspaceRepository.getById(workspace_id)
        return response.status(200).json({
            message: "Espacio de trabajo actualizado exitosamente",
            ok: true,
            status: 200,
            data: {
                workspace: workspace_after_update
            }
        });




    }

}

const workspaceController = new WorkspaceController();
export default workspaceController;
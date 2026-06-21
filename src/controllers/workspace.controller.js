import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import ServerError from "../helpers/serverError.helper.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";


class WorkspaceController {
    async create(request, response) {

        const { nombre, descripcion } = request.body;

        //Para que esto funcione se debe ejecutar previamente el authMiddleware
        const user_id = request.user.id;

        if (!nombre || nombre.trim() === '') {
            throw new ServerError("El nombre del espacio de trabajo es obligatorio", 400);
        }

        //crea el espacio de trabajo
        const newWorkspace = await workspaceRepository.create(
            nombre,
            descripcion || ''
        );

        //creamos la membresia del dueño
        await workspaceMemberRepository.create(
            user_id,
            newWorkspace._id,
            MEMBER_WORKSPACE_ROLES.OWNER,
            MEMBER_INVITATION_STATUS.ACCEPTED, //Aceptamos automaticamente debido a que es el mismo dueño, se autogenero
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

    async getAllByUser(req, res) {

        const user_id = req.user.id;

        //Quiero obtener la lista de membresias de un usuario
        //Y cada membresia traera consigo la info del espacio de trabajo asociado
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
import workspaceService from "../services/workspace.service.js";

class WorkspaceController {
    async create(request, response) {
        const { nombre, descripcion } = request.body;
        const user_id = request.user.id;

        const newWorkspace = await workspaceService.create(user_id, nombre, descripcion);

        return response.status(201).json({
            ok: true,
            message: "Espacio de trabajo creado con éxito",
            data: {
                workspace: newWorkspace
            }
        });
    }

    async getById(request, response) {
        const workspace = await workspaceService.getById(request.params.workspace_id);

        //la membresía la deja el workspaceMiddleware en la request; sirve para que el front sepa qué acciones habilitar
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
        });
    }

    async getAllByUser(req, res) {
        const workspaces = await workspaceService.getAllByUser(req.user.id);

        return res.status(200).json({
            ok: true,
            message: "Espacios de trabajo obtenidos",
            data: {
                workspaces
            }
        });
    }

    async deleteById(request, response) {
        const deleted_workspace = await workspaceService.deleteById(request.params.workspace_id);

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
        const updated_workspace = await workspaceService.updateById(request.params.workspace_id, request.body);

        return response.status(200).json({
            message: "Espacio de trabajo actualizado exitosamente",
            ok: true,
            status: 200,
            data: {
                workspace: updated_workspace
            }
        });
    }
}

const workspaceController = new WorkspaceController();
export default workspaceController;

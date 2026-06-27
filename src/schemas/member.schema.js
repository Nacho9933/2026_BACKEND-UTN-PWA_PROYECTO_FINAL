import { z } from "zod";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";

//no se puede invitar ni asignar el rol de dueño: la propiedad es del creador
const assignableRole = z.enum(
    [MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.USER],
    { message: "Rol inválido" }
);

export const inviteMemberSchema = z.object({
    invited_email: z.email("Email inválido"),
    role: assignableRole,
});

export const updateMemberRoleSchema = z.object({
    role: assignableRole,
});

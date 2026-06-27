import { z } from "zod";

//en los update el front siempre manda nombre y descripcion: tratamos el string vacío como "no enviado"
const emptyToUndefined = (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

export const createWorkspaceSchema = z.object({
    nombre: z
        .string({ message: "El nombre del espacio de trabajo es obligatorio" })
        .trim()
        .min(1, "El nombre del espacio de trabajo es obligatorio"),
    descripcion: z.string().trim().optional(),
});

export const updateWorkspaceSchema = z
    .object({
        nombre: z.preprocess(
            emptyToUndefined,
            z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").optional()
        ),
        descripcion: z.preprocess(
            emptyToUndefined,
            z.string().trim().optional()
        ),
    })
    .refine((data) => data.nombre !== undefined || data.descripcion !== undefined, {
        message: "Debes enviar al menos un campo para actualizar",
    });

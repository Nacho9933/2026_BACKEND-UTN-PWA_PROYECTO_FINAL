import { z } from "zod";

const emptyToUndefined = (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

export const createChannelSchema = z.object({
    nombre: z
        .string({ message: "El nombre del canal es obligatorio" })
        .trim()
        .min(1, "El nombre del canal es obligatorio"),
    descripcion: z.string().trim().optional(),
});

export const updateChannelSchema = z
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

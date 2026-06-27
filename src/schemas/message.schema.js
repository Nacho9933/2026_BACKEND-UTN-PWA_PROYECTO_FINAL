import { z } from "zod";

const contenidoSchema = z
    .string({ message: "El contenido del mensaje es obligatorio" })
    .trim()
    .min(1, "El contenido del mensaje es obligatorio")
    .max(5000, "El mensaje no puede exceder 5000 caracteres");

export const createMessageSchema = z.object({
    contenido: contenidoSchema,
});

export const updateMessageSchema = z.object({
    contenido: contenidoSchema,
});

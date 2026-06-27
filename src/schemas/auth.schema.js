import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string({ message: "El nombre es obligatorio" })
        .trim()
        .min(3, "El nombre debe tener más de 2 caracteres"),
    email: z.email("Email inválido"),
    password: z
        .string({ message: "La contraseña es obligatoria" })
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const loginSchema = z.object({
    email: z.email("Email inválido"),
    password: z
        .string({ message: "La contraseña es obligatoria" })
        .min(6, "Contraseña invalida"),
});

export const resetPasswordRequestSchema = z.object({
    email: z.email("Email inválido"),
});

export const resetPasswordConfirmSchema = z.object({
    newPassword: z
        .string({ message: "La contraseña es obligatoria" })
        .min(6, "Contraseña invalida"),
});

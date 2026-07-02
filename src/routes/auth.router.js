import express from 'express'
import authController from '../controllers/auth.controller.js'
import validate from '../middlewares/validate.middleware.js'
import {
    registerSchema,
    loginSchema,
    resetPasswordRequestSchema,
    resetPasswordConfirmSchema,
    refreshSchema
} from '../schemas/auth.schema.js'


const authRouter = express.Router()

authRouter.post(
    '/register',
    validate(registerSchema),
    authController.register
)

authRouter.get(
    '/verify-email',
    authController.verifyEmail
)

authRouter.post(
    '/login',
    validate(loginSchema),
    authController.login
)

authRouter.post(
    '/refresh',
    validate(refreshSchema),
    authController.refresh
)

authRouter.post(
    '/reset-password-request',
    validate(resetPasswordRequestSchema),
    authController.resetPasswordRequest
);

authRouter.post(
    '/reset-password',
    validate(resetPasswordConfirmSchema),
    authController.resetPasswordConfirm
)

export default authRouter

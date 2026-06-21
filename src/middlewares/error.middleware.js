import jwt from 'jsonwebtoken'
import ServerError from '../helpers/serverError.helper.js';


function errorHandlerMiddleware(error, req, res, next) {
    if (
        error instanceof jwt.JsonWebTokenError
        ||
        error instanceof jwt.NotBeforeError
        ||
        error instanceof jwt.TokenExpiredError
    ) {
        return res.status(401).json(
            {
                message: "Token invalido",
                ok: false,
                status: 401
            }
        )
    }
    else if (error instanceof ServerError) {
        return res.status(error.status).json(
            {
                message: error.message,
                ok: false,
                status: error.status
            }
        )
    }
    else {
        console.error('Error critico:', error);
        return res.status(500).json({
            message: "Error interno del servidor",
            ok: false,
            status: 500
        });
    }
}

export default errorHandlerMiddleware
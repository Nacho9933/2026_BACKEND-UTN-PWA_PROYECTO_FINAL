import ServerError from "../helpers/serverError.helper.js";

//valida el body contra un schema de zod; si falla devuelve un 400 con los mensajes
function validate(schema) {
    return function (request, response, next) {
        const result = schema.safeParse(request.body);

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => issue.message)
                .join(". ");
            return next(new ServerError(message, 400));
        }

        //reemplazamos el body por los datos ya parseados y limpios
        request.body = result.data;
        return next();
    };
}

export default validate;

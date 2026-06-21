import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import express from "express";

/* SOLO EN LOCAL Y SI TENER PROBLEMAS DE DNS PARA CONECTARTE A MONGODB */
import dns from 'dns';
import authRouter from "./routes/auth.router.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import workspaceRouter from "./routes/workspace.router.js";


if(ENVIRONMENT.MODE === 'development'){
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB()

/* 
Crear una API de express
Route:
    /api/auth => Trabaja todo lo relacionado a autentificacion
        POST /register
            body: {name, email, password}
            Validar que el usuario tenga nombre mayor a 2 caracteres
            Validar email
            Validar password con almenos 6 caracteres 
            Crear un usuario en la DB
        



Mas Adelante...
        POST /login
        
RECOMENDACION:
    El controller puede ser asincrono!!
    authRouter.post(
        '/register', 
        async (request, response) => {
            await userRepository.create('pepe')
        }
    )
*/
import cors from 'cors'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";

const app = express();
const PORT = ENVIRONMENT.PORT;

// Habilitamos las consultas cross-origin
app.use(cors())

// Parse JSON
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter)

/* 
TAREA PARA 2/6
    POST /api/auth/reset-password-request
        body: {
            email: 'email de usuario solicitante'
        }
        Que hace?
            -Verifica que el usuario exista
            -Genera un jwt con el id o email del usuario como payload (carga, contenido)
            -Genera un mail y lo envia a la casilla indicada en el body con un ancla `${ENVIRONMENT.URL_FRONTEND}/reset-password?reset_password_token=${token}`
    
    POST /api/auth/reset-password
        headers: {
            "Authorization": "bearer {reset_password_token}"
        },
        body: {
            new_password: "pepe_123"
        }
        Que hace?
            -Capturamos de request.headers.authorization el token 
            -Validamos el token (sino esta o es invalido 401 Unauthorized)
            -Hasheamos la nueva contraseña que nos dan por body
            -Con el id o email indicado en el token, buscamos en la DB y actualizamos la password con el nuevo hash (ya que estan le pueden validar el mail, debido a que el proceso requiere que el usuario use su casilla)
  
    Recomendacion personal:
        NO hagan nada de front, prueben todo con postman
        NO hagan los dos controladores, hagan 1, lo prueban y luego el siguiente




TAREA 4/6:
    Poder invitar gente a nuestro espacio de trabajo (si somos admin o owner)
    Coinsideraciones:
        - No puedo invitar gente que no existe
        - Tengo que poder aceptar la invitacion ( mi membresia )
            Que cambio deberiamos hacer en la DB?
                - Crear una coleccion de InvitationWorkspace
                - Modificar la coleccion de membresias para que soporte el estado de invitacion
        - Que sucede si un usuario ya tiene una invitacion pendiente? y rechazada? y aceptada?
            - Pendiente: Ya has invitado a este usuario (tener en cuenta que si se trabaja con fechas de expiracion debemos guardar tambien hasta que momento puede la invitacion estar pendiente, ya que si una invitacion pendiente expiro conviene eliminar la existente y recrear una nueva)
            - Rechazada: Si fue rechazado ver si paso el tiempo limite de validez de rechazo (Depende de si queremos tener este tiempo limite). Si no paso este tiempo decir 'El usuario rechazo tu invitacion'
            - Aceptada: El usuario ya es un miembro del espacio de trabajo
        
    authMiddleware, workspaceMiddleware(['owner', 'admin']) POST /api/workspace/:workspace_id/members
        body {
            invited_email: email del usuario invitado, 
            role: Rol del usuario invitado
        }
    
    - Validar que el usuario invitado exista
    - Validamos que no tenga una membresia con este espacio de trabajo
    - Creamos membresia con estado pendiente
    - Creamos 1 tokens, con el {id_member} 
    - Redactamos el mail con los botones de aceptar y rechazar que envien un GET hacia /api/workspace/:workspace_id/members/:decision?token



*/



//Siempre debe estar al final
//Esto es debido a que este middleware se ejecutara entre el controller y la response del servidor
app.use(errorHandlerMiddleware)

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


/* 

/api/auth => Trabaja todo lo relacionado a autentificacion 
/api/workspace => Trabaja todo lo relacionado a workspaces
    /:workspace_id/members => Todo lo relacionado a membresias
    /:workspace_id/channels => Todo lo relacionado a canales
        /:channel_id/messages => Todo lo relacionado a mensajes
    /:workspace_id/contacts


Crear mensaje: 
    POST /api/workspaces/:workspace_id/channels/:channel_id/messages
    authMiddleware
    verifyWorkspaceMiddleware
    verifyChannelMiddleware
    messagesController.create()
*/
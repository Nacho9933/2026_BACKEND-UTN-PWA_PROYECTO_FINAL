# Slack API - Backend

Este es el backend para la aplicación estilo Slack, desarrollado con **Node.js**, **Express** y **MongoDB**. Proporciona autenticación segura de usuarios, gestión de espacios de trabajo (workspaces), invitaciones de miembros por correo electrónico y control de acceso basado en roles.

---

## 🛠️ Stack Tecnológico

- **Core**: Node.js & Express (v5.x)
- **Base de Datos**: MongoDB a través de Mongoose (v9.x)
- **Autenticación**: JSON Web Tokens (JWT) & bcrypt para hasheo de contraseñas
- **Envío de Correos**: Nodemailer (v6.x) con transporte SMTP (Gmail)
- **Seguridad**: CORS habilitado

---

## ⚙️ Configuración del Entorno (`.env`)

Para ejecutar este proyecto de forma local, crea un archivo `.env` en la raíz de la carpeta `Backend` con las siguientes variables:

```env
MONGO_DB_CONNECTION_STRING=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net
MONGO_DB_NAME=nombre_de_tu_base_de_datos
MODE=development # development / production
PORT=8080
URL_BACKEND=http://localhost:8080
URL_FRONTEND=http://localhost:5173
JWT_SECRET=tu_secreto_super_seguro
GMAIL_USERNAME=tu_correo_gmail@gmail.com
GMAIL_PASSWORD=tu_contraseña_de_aplicacion_gmail
```

---

## 🚀 Instalación y Ejecución

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar en modo desarrollo (con auto-reload)**:
   ```bash
   npm run dev
   ```

3. **Iniciar en producción**:
   ```bash
   npm start
   ```

---

## 🛡️ Middlewares de Seguridad

El backend implementa las siguientes capas de seguridad:
- **`authMiddleware`**: Valida que la petición incluya un token JWT válido en el header `Authorization: Bearer <token>`. Al validarse, inyecta los datos del usuario autenticado en `req.user`.
- **`workspaceMiddleware([roles])`**: Valida que el usuario tenga una membresía activa en el espacio de trabajo especificado en los parámetros (`:workspace_id`) y que su rol coincida con alguno de los roles autorizados (ej. `owner`, `admin`).

---

## 📁 Detalle de Endpoints / Rutas

### 🔐 1. Autenticación (`/api/auth`)

Maneja el registro, verificación de correo, inicio de sesión y restablecimiento de contraseña.

---

#### 📥 **Registrar Usuario**
* **Ruta**: `POST /api/auth/register`
* **Autenticación**: Ninguna (Público)
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "name": "Nombre Usuario",
    "email": "correo@ejemplo.com",
    "password": "miPasswordSegura"
  }
  ```
* **Validaciones**:
  * `name`: Obligatorio, longitud mayor a 2 caracteres.
  * `email`: Obligatorio, formato de correo válido, único en el sistema.
  * `password`: Obligatorio, longitud mínima de 6 caracteres.
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "message": "Usuario registrado con éxito",
    "ok": true,
    "status": 201,
    "data": {
      "user": {
        "id": "6a0f8abf...",
        "name": "Nombre Usuario",
        "email": "correo@ejemplo.com"
      }
    }
  }
  ```
* **Efecto Secundario**: Envía un correo electrónico de verificación al usuario con un enlace que expira y apunta a `/api/auth/verify-email?verification_token=<token>`.

---

#### 📧 **Verificar Correo Electrónico**
* **Ruta**: `GET /api/auth/verify-email`
* **Autenticación**: Ninguna (Público, usualmente accedido vía correo)
* **Parámetros de Consulta (Query Params)**:
  * `verification_token` (String, Obligatorio)
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Email verificado correctamente. ¡Ya puedes usar tu cuenta!"
  }
  ```
* **Errores Comunes**:
  * `400 Bad Request`: Falta el token o el email ya ha sido verificado.
  * `401 Unauthorized`: Token inválido o expirado.

---

#### 🔑 **Iniciar Sesión (Login)**
* **Ruta**: `POST /api/auth/login`
* **Autenticación**: Ninguna (Público)
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "email": "correo@ejemplo.com",
    "password": "miPasswordSegura"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Usuario autentificado exitosamente",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
    }
  }
  ```
* **Errores Comunes**:
  * `401 Unauthorized`: Contraseña incorrecta o verificación de correo pendiente.
  * `404 Not Found`: Usuario no registrado.

---

#### 📧 **Solicitar Restablecer Contraseña**
* **Ruta**: `POST /api/auth/reset-password-request`
* **Autenticación**: Ninguna (Público)
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "email": "correo@ejemplo.com"
  }
  ```
* **Respuesta (200 OK)**:
  *(Por seguridad contra enumeración de usuarios, siempre responde con el mismo mensaje si el formato es correcto)*
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
  }
  ```
* **Efecto Secundario**: Si el usuario existe, se genera un token de un solo uso que expira en **15 minutos** y se envía al correo un enlace: `${URL_FRONTEND}/reset-password?token=${token}`.

---

#### 🔄 **Confirmar Restablecimiento de Contraseña**
* **Ruta**: `POST /api/auth/reset-password`
* **Autenticación**: Requiere Token de Restablecimiento en los Headers
* **Headers**:
  * `Authorization: Bearer <reset_token>`
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "newPassword": "nuevaContrasenaSegura"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Contraseña restablecida exitosamente"
  }
  ```

---

### 🏢 2. Espacios de Trabajo (`/api/workspace`)

Maneja la creación, lectura, actualización y eliminación de los espacios de trabajo, así como la gestión de sus miembros.

---

#### ➕ **Crear Espacio de Trabajo**
* **Ruta**: `POST /api/workspace`
* **Autenticación**: Requerida (`authMiddleware`)
* **Headers**: `Authorization: Bearer <token>`
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "nombre": "Mi Espacio de Trabajo",
    "descripcion": "Descripción opcional del espacio"
  }
  ```
* **Respuesta Exitosa (201 Created)**:
  ```json
  {
    "ok": true,
    "message": "Espacio de trabajo creado con éxito",
    "data": {
      "workspace": {
        "_id": "6a0f8abf...",
        "nombre": "Mi Espacio de Trabajo",
        "descripcion": "Descripción opcional del espacio",
        "estado": true,
        "fecha_creacion": "2026-06-17T00:00:00.000Z"
      }
    }
  }
  ```
* **Efecto Secundario**: Crea automáticamente una membresía para el usuario creador con el rol de `owner` (Dueño) y estado de invitación `accepted` (Aceptado).

---

#### 📋 **Obtener Espacios de Trabajo del Usuario**
* **Ruta**: `GET /api/workspace`
* **Autenticación**: Requerida (`authMiddleware`)
* **Headers**: `Authorization: Bearer <token>`
* **Respuesta Exitosa (200 OK)**:
  *(Retorna la lista plana de membresías del usuario junto a la información del espacio de trabajo)*
  ```json
  {
    "ok": true,
    "message": "Espacios de trabajo obtenidos",
    "data": {
      "workspaces": [
        {
          "member_id": "6a0f8abf40529437fb3a5436",
          "member_rol": "dueño",
          "member_fecha_union": "2026-05-21T22:44:15.603Z",
          "workspace_id": "6a0f8abf40529437fb3a5435",
          "workspace_nombre": "Test actualizado",
          "workspace_descripcion": "lorem ipsum"
        }
      ]
    }
  }
  ```

---

#### ✏️ **Actualizar Espacio de Trabajo**
* **Ruta**: `PUT /api/workspace/:workspace_id`
* **Autenticación**: Requerida (`authMiddleware` + `workspaceMiddleware(['admin', 'owner'])`)
* **Headers**: `Authorization: Bearer <token>`
* **Parámetros URL**:
  * `workspace_id`: ID del espacio de trabajo a actualizar.
* **Cuerpo de la Petición (JSON)** (Envía al menos uno):
  ```json
  {
    "nombre": "Nuevo Nombre del Espacio",
    "descripcion": "Nueva descripción del espacio"
  }
  ```
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Espacio de trabajo actualizado exitosamente",
    "ok": true,
    "status": 200,
    "data": {
      "workspace": {
        "_id": "6a0f8abf...",
        "nombre": "Nuevo Nombre del Espacio",
        "descripcion": "Nueva descripción del espacio",
        "estado": true
      }
    }
  }
  ```

---

#### 🗑️ **Eliminar Espacio de Trabajo (Soft Delete)**
* **Ruta**: `DELETE /api/workspace/:workspace_id`
* **Autenticación**: Requerida (`authMiddleware` + `workspaceMiddleware(['owner'])`)
* **Headers**: `Authorization: Bearer <token>`
* **Parámetros URL**:
  * `workspace_id`: ID del espacio de trabajo a eliminar.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "message": "Espacio de trabajo eliminado exitosamente",
    "ok": true,
    "status": 200,
    "data": {
      "workspace": {
        "_id": "6a0f8abf...",
        "nombre": "Nombre del Espacio",
        "estado": false
      }
    }
  }
  ```

---

#### ✉️ **Invitar Miembro al Espacio de Trabajo**
* **Ruta**: `POST /api/workspace/:workspace_id/members`
* **Autenticación**: Requerida (`authMiddleware` + `workspaceMiddleware(['owner', 'admin'])`)
* **Headers**: `Authorization: Bearer <token>`
* **Parámetros URL**:
  * `workspace_id`: ID del espacio de trabajo.
* **Cuerpo de la Petición (JSON)**:
  ```json
  {
    "invited_email": "amigo@ejemplo.com",
    "role": "member" // u otro rol definido en el sistema
  }
  ```
* **Validaciones**:
  * El usuario invitado debe existir en el sistema.
  * El usuario no debe poseer una membresía activa (`accepted`), ni una invitación pendiente válida (`pending`). Si expiró la invitación anterior, se descarta y se genera una nueva.
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "message": "Invitación enviada con éxito"
  }
  ```
* **Efecto Secundario**: Crea una membresía con estado `pending` y envía un correo electrónico de invitación con enlaces para Aceptar o Rechazar la invitación, que redirigen a la ruta correspondiente con un token que expira en 30 días.

---

#### 🙋‍♂️ **Aceptar/Rechazar Invitación de Miembro**
* **Ruta**: `GET /api/workspace/:workspace_id/members/:decision`
* **Autenticación**: Ninguna directamente (Usa token en Query Param)
* **Parámetros URL**:
  * `workspace_id`: ID del espacio de trabajo.
  * `decision`: Debe ser exactamente `accepted` o `rejected`.
* **Parámetros de Consulta (Query Params)**:
  * `invitation_token`: Token JWT de la invitación (Obligatorio).
* **Respuesta Exitosa (200 OK)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Decision de accepted tomada con exito!"
  }
  ```
* **Errores Comunes**:
  * `400 Bad Request`: Token inválido, expirado (validez de 30 días), invitación ya procesada anteriormente o decisión inválida.

---

## 📬 Pruebas con Postman

En la raíz del directorio `Backend` se encuentra la colección lista para importar en Postman:
📄 **`Api Slack-9-6.postman_collection.json`**

Esta colección contiene:
1. Peticiones organizadas para todos los endpoints.
2. Scripts automáticos en el endpoint de **Login** para guardar el `access_token` en la variable de colección `api_slack_auth_token`, de modo que no sea necesario copiar y pegar el token manualmente para las peticiones autenticadas.

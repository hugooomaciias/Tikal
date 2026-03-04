<a id="top"></a>
# 🔐 Documentación de endpoints de autenticación

Este documento describe todos los endpoints relacionados con la autenticación para la API de Tikal. Aquí encontrarás los formatos de solicitud requeridos, las respuestas esperadas y el manejo de errores para las operaciones de registro de usuario, inicio de sesión, renovación de token y cierre de sesión.

---

## 📋 Índice

- [Auth Controller](#auth-controller)
  - [1. Registro de Usuario](#1-registro-de-usuario-post-authregister)
  - [2. Inicio de Sesión](#2-inicio-de-sesión-post-authlogin)
  - [3. Renovación de Sesión](#3-renovación-de-sesión-post-authrefresh)
  - [4. Cierre de Sesión](#4-cierre-de-sesión-post-authlogout)
  - [5. Solicitar Recuperación de Contraseña](#5-solicitar-recuperación-de-contraseña-post-authforgot-password)
  - [6. Verificar Código OTP](#6-verificar-código-otp-post-authverify-otp)
  - [7. Restablecer Contraseña](#7-restablecer-contraseña-post-authreset-password)
- [Manejo de Errores](#manejo-de-errores)
  - [Error 409 (Conflicto)](#1-error-409-conflicto)
  - [Error 404 (No Encontrado)](#2-error-404-no-encontrado)
  - [Error 401 (No Autorizado)](#3-error-401-no-autorizado)
  - [Error 400 (Solicitud Incorrecta)](#4-error-400-solicitud-incorrecta)
- [Organización de Excepciones](#organización-de-excepciones)

---

## Auth Controller

### 1. Registro de Usuario (`Post /auth/register`)

**Propósito**: Crear una nueva cuenta en la plataforma. Valida que el usuario o email no existan previamente, encripta la contraseña, guarda el usuario en la base de datos y genera su primer par de tokens para que pueda iniciar sesión automáticamente al registrarse.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```JSON
{
  "name": "uniqueUsername",
  "email": "uniqueUserEmail@example.com",
  "password": "mySecurePassword123",
  "subscriptionPlan": "GRATUITO" 
}
```
*(Nota: subscriptionPlan acepta "GRATUITO" o "COMUNITARIO", sin distinguir mayúsculas/minúsculas).*

**Response (201 CREATED)**:

```JSON
{
  "access_token": "eyJhbGciOiJIUz... (Token corto de 15 min)",
  "refresh_token": "eyJhbGciOiJIUz... (Token largo de 7 días)"
}
```

### 2. Inicio de Sesión (`Post /auth/login`)

**Propósito**: Autenticar a un usuario existente. Verifica que las credenciales coincidan con la base de datos y, si son correctas, devuelve un nuevo par de tokens (y guarda el nuevo Refresh Token en la base de datos).

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:
```json
{
  "identifier": "usernameOrEmail", 
  "password": "mySecurePassword123"
}
```
*(Nota: identifier puede ser tanto el email como el nombre de usuario).*

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUz...",
  "refresh_token": "eyJhbGciOiJIUz..."
}
```

### 3. Renovación de Sesión (`Post /auth/refresh`)

**Propósito**: Es la "puerta trasera" segura. Se utiliza para obtener un nuevo Access Token cuando el anterior ha expirado (devolviendo un error 401 en otras rutas). El frontend lo usa de forma "silenciosa" para que el usuario no tenga que volver a escribir su contraseña.

**Uso para el cliente**: úsalo cuando una petición a la API falle con error 401 "Token expired". El frontend lo llama silenciosamente con el refresh token para obtener un nuevo access token, luego reintenta la petición original automáticamente.

**Request (el body va vacío)**:
```HTTP
POST /auth/refresh HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUz... (el refresh token)
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUz... (el NUEVO access token)",
  "refresh_token": "eyJhbGciOiJIUz... (el MISMO Refresh Token que enviaste)"
}
```

### 4. Cierre de Sesión (`Post /auth/logout`)

**Propósito**: Invalida la sesión actual del usuario en la base de datos. Busca el Refresh Token específico de ese dispositivo y lo marca como revocado/expirado para que no pueda generar más Access Tokens en el futuro.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```json
{
  "refresh_token": "eyJhbGciOiJIUz... (El Refresh Token que queremos destruir)"
}
```
**Response (200 OK)**: *(Cuerpo vacío, solo el código HTTP confirmando el éxito)*

### 5. Solicitar Recuperación de Contraseña (`Post /auth/forgot-password`)

**Propósito**: Inicia el flujo de recuperación de contraseña. Genera un código OTP seguro de 6 dígitos, lo asocia al usuario en la base de datos (con una validez temporal de 8 minutos) y envía un correo electrónico asíncrono en formato HTML. Si el usuario solicita un nuevo código, el anterior se sobrescribe (Upsert).

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
Devuelve un mensaje genérico (texto plano) siempre, independientemente de si el correo existe o no en la base de datos, para evitar ataques de enumeración de usuarios.

```text
Si los datos son correctos, se ha enviado un código a tu correo.
```

### 6. Verificar Código OTP (`Post /auth/verify-otp`)

**Propósito**: Valida que el código OTP ingresado por el usuario coincide con el de la base de datos y no ha expirado. El frontend utiliza este endpoint de transición para decidir si permite al usuario acceder a la pantalla final de "Nueva Contraseña".

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```json
{
  "email": "user@example.com",
  "otpCode": "482910"
}
```

**Response (200 OK)**: *(Texto plano)*

```text
Código verificado correctamente.
```

### 7. Restablecer Contraseña (`Post /auth/reset-password`)

**Propósito**: Ejecuta el cambio definitivo de credenciales. Al ser una API sin estado (stateless), vuelve a validar el código OTP, encripta la nueva contraseña, la actualiza en la base de datos y, crucialmente, elimina el código OTP consumido para evitar que sea reutilizado.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```json
{
  "email": "user@example.com",
  "otpCode": "482910",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK)**: *(Texto plano)*

```text
Contraseña actualizada con éxito.
```

<p align="right">
<a href="#top">⬆️ Volver arriba</a>
</p>

---

## Manejo de Errores

### 1. Error 409 (Conflicto)

Se devuelve cuando el registro de usuario falla debido a datos duplicados en la base de datos. El campo `error` indica el tipo específico de conflicto:

```json
{
    "error": "1 Data conflict",
    "message": "El nombre de usuario 'uniqueUsername' ya está en uso."
}
```

```json
{
    "error": "2 Data conflict",
    "message": "El email 'user@example.com' ya existe en la plataforma."
}
```

```json
{
    "error": "3 Data conflict",
    "message": "Tanto el nombre de usuario 'uniqueUsername' como el email 'user@example.com' ya están registrados."
}
```

**Tipos de conflicto:**
- **`1 Data conflict`** → El nombre de usuario ya existe
- **`2 Data conflict`** → El email ya existe
- **`3 Data conflict`** → Tanto el nombre de usuario como el email ya existen

### 2. Error 404 (No Encontrado)

El recurso solicitado que el cliente busca no existe en la base de datos (ej: intentar iniciar sesión con un email no registrado):

```json
{
  "error": "Not found",
  "message": "Usuario no encontrado con esas credenciales."
}
```

### 3. Error 401 (No Autorizado)

El usuario intenta autenticarse sin token, o utiliza un Refresh Token que ha sido manipulado, expirado, revocado, o falla la validación criptográfica:

```json
{
  "error": "Authentication failed",
  "message": "Refresh token no encontrado en nuestros registros."
}
```

También se devuelve este error cuando el código de validación que ha introducido el usuario para cambiar la contraseña es incorrectoy no es el que se ha enviado por correo, se vería así:

```json
{
  "error": "Invalid credentials",
  "message": "El código introducido es incorrecto."
}
```

### 4. Error 400 (Solicitud Incorrecta)

El cliente envía datos malformados (ej: un plan de suscripción inválido) o un encabezado mal formateado (ej: falta el prefijo "Bearer "):

```json
{
  "error": "Invalid data",
  "message": "Plan de suscripción inválido. Valores permitidos: [GRATUITO, COMUNITARIO]"
}
```

En la parte del cambio de contraseña debido a un olvido del usuario, se envía este error en el caso de que el token haya caducado o no exista ninguna solicitud de cambio de contraseña pendiente.

```json
{
  "error": "Expired resource",
  "message": "El código ha caducado. Por favor, solicita uno nuevo."
}
```

<p align="right">
    <a href="#top">⬆️ Volver arriba</a>
</p>

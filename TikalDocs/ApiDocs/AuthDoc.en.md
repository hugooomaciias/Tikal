<a id="top"></a>
# 🔐 Auth endpoint documentation

This document describes all authentication-related endpoints for the Tikal API. Here you'll find the required request formats, expected responses, and error handling for user registration, login, token refresh, and logout operations.

---

## 📋 Index

- [Auth Controller](#auth-controller)
  - [1. User Registration](#1-user-registration-post-authregister)
  - [2. User Login](#2-user-login-post-authlogin)
  - [3. Session Refresh](#3-session-refresh-post-authrefresh)
  - [4. User Logout](#4-user-logout-post-authlogout)
- [Error Handling](#error-handling)
  - [Error 409 (Conflict)](#1-error-409-conflict)
  - [Error 404 (Not Found)](#2-error-404-not-found)
  - [Error 401 (Unauthorized)](#3-error-401-unauthorized)
  - [Error 400 (Bad Request)](#4-error-400-bad-request)
- [Exceptions Organization](#exceptions-organization)

---


## Auth Controler

### 1. User registration (`Post /auth/register`)

**Purpose**: Create a new account on the platform. Validate that the user or email does not already exist, encrypt the password, save the user in the database, and generate their first pair of tokens so that they can log in automatically upon registration.

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
*(Note: subscriptionPlan accepts "GRATUITO" or "COMUNITARIO", case-insensitive).*

**Response (201 CREATED)**:

```JSON
{
  "access_token": "eyJhbGciOiJIUz... (Token corto de 15 min)",
  "refresh_token": "eyJhbGciOiJIUz... (Long-lived 7-day token)"
}
```


### 2. User login (`Post /auth/login`)

**Purpose**: Authenticate an existing user. Verifies that the credentials match the database and, if correct, returns a new pair of tokens (and saves the new Refresh Token in the database).

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:
```json
{
  "identifier": "usernameOrEmail", 
  "password": "mySecurePassword123"
}
```
*(Note: identifier can be either email or username).*

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUz...",
  "refresh_token": "eyJhbGciOiJIUz..."
}
```

### 3. Session Refresh (`Post /auth/refresh`)

**Purpose**: This is the secure "back door." It's used to obtain a new Access Token when the previous one has expired (returning a 401 error on other routes). It's used "silently" by the frontend so the user doesn't have to re-enter their password.

**Client use**: use it when an API request fails with a 401 "Token expired" error. The frontend calls it silently with the refresh token to get a new acces token, then retries the original request automatically.

**Request (the body is empty)**:
```HTTP
POST /auth/refresh HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUz... (the refresh token)
```

**Response (200 OK)**:

```json
{
  "access_token": "eyJhbGciOiJIUz... (the NEW acces Token)",
  "refresh_token": "eyJhbGciOiJIUz... (the SAME Refresh Token you sent)"
}
```

### 4. User Logout (`Post /auth/logout`)

**Purpose**: Invalidates the user's current session in the database. Finds the specific Refresh Token for that device and marks it as revoked/expired so it cannot generate more Access Tokens in the future.

**Request (Headers)**: `Content-Type: application/json`

**Request (Body)**:

```json
{
  "refreshToken": "eyJhbGciOiJIUz... (The Refresh Token we want to destroy)"
}
```
**Response (200 OK)**: *(Empty body, only HTTP status code confirming success)*

<p align="right">
    <a href="#top">⬆️ Back to top</a>
</p>

---

## Error handling

### 1. Error 409 (Conflict)

Returned when user registration fails due to duplicate data in the database. The `error` field indicates the specific type of conflict:

```json
{
    "error": "1 Data conflict",
    "message": "The username 'uniqueUsername' is already taken."
}
```

```json
{
    "error": "2 Data conflict",
    "message": "The email 'user@example.com' already exists on the platform."
}
```

```json
{
    "error": "3 Data conflict",
    "message": "Both username 'uniqueUsername' and email 'user@example.com' are already registered."
}
```

**Conflict types:**
- **`1 Data conflict`** → Username already exists
- **`2 Data conflict`** → Email already exists  
- **`3 Data conflict`** → Both username and email already exist

### 2. Error 404 (Not found)

The requested resource that the client is looking for doesn't exist on the database (e.g., trying to log in with an unregistered email):

```json
{
  "error": "Not found",
  "message": "User not found with those credentials."
}
```

### 3. Error 401 (Unauthorized)

The user attempts to authenticate without a token, or uses a Refresh Token that has been manipulated, expired, revoked, or fails cryptographic validation:

```json
{
  "error": "Authentication failed",
  "message": "Refresh token not found in our records."
}
```

### 4. Error 400 (Bad request)

The client sends malformed data (e.g., an invalid subscription plan) or a badly formatted header (e.g., missing the "Bearer " prefix):

```json
{
  "error": "Invalid data",
  "message": "Invalid subscription plan. Allowed values: [GRATUITO, COMUNITARIO]"
}
```

<p align="right">
    <a href="#top">⬆️ Back to top</a>
</p>
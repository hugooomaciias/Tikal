# 📊 Diagrama de la Arquitectura de la Aplicación

## 1. Estructura de Carpetas Visual

```
frontend/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Square.jsx
│   │   └── WinnerModal.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── LandingPage.jsx
│   │   └── LoadingScreen.jsx
│   │
│   ├── styles/
│   │   ├── GlobalStyles.css
│   │   ├── LandingPage.css
│   │   ├── AuthPages.css
│   │   ├── LoadingScreen.css
│   │   └── Dashboard.css
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
├── package.json
├── vite.config.js
└── eslint.config.js
```

## 2. Flujo de Componentes y State

```
App (BrowserRouter + AuthProvider)
│
└── AuthContext (Proveedor de Estado Global)
    ├── State: { user, isAuthenticated, isLoading }
    └── Métodos: { login(), register(), logout() }
        │
        ├── Route "/"
        │   └── LandingPage
        │
        ├── Route "/login"
        │   └── LoginPage
        │       └── useAuth()
        │
        ├── Route "/register"
        │   └── RegisterPage
        │       └── useAuth()
        │
        ├── Route "/loading"
        │   └── LoadingScreen
        │       └── useAuth()
        │
        └── Route "/dashboard" (Protegida)
            └── ProtectedRoute
                ├── Verifica AuthContext
                └── Dashboard
                    └── useAuth()
```

## 3. Ciclo de Vida de Autenticación

```
┌─────────────────┐
│  Landing Page   │
└────────┬────────┘
         │
         ├──→ Click "Iniciar Sesión" ──→ ┌──────────────┐
         │                                │ LoginPage    │
         │                                └──────┬───────┘
         │                                       │
         │                                  Submit Login
         │                                       │
         │                                       ↓
         │                    ┌──────────────────────────────┐
         │                    │  AuthContext.login()         │
         │                    │ - setIsLoading(true)         │
         │                    │ - Simula API (1.5s)          │
         │                    │ - setUser(userData)          │
         │                    │ - localStorage.setItem()     │
         │                    │ - setIsLoading(false)        │
         │                    └──────────────┬───────────────┘
         │                                   │
         │                                   ↓
         │                    ┌──────────────────────────────┐
         │                    │  Navigate to "/loading"      │
         │                    │  LoadingScreen detects       │
         │                    │  isLoading = false           │
         │                    └──────────────┬───────────────┘
         │                                   │
         │                                   ↓
         │                    ┌──────────────────────────────┐
         │                    │  ProtectedRoute              │
         │                    │  - Verifica isAuthenticated  │
         │                    │  - Permite acceso            │
         │                    └──────────────┬───────────────┘
         │                                   │
         │                                   ↓
         │                    ┌──────────────────────────────┐
         │                    │  Dashboard                   │
         │                    │  - Muestra usuario           │
         │                    │  - Opción logout             │
         │                    └──────────────────────────────┘
         │
         └──→ Click "Registrarse" ──→ ┌──────────────┐
                                       │ RegisterPage │
                                       └──────┬───────┘
                                              │
                                         Submit Register
                                              │
                                              ↓
                                       [Mismo flujo que login]
```

## 4. Sistema de Rutas (React Router)

```
BrowserRouter
│
├── PUBLIC ROUTES (sin protección)
│   ├── "/" → LandingPage
│   ├── "/login" → LoginPage
│   └── "/register" → RegisterPage
│
├── LOADING ROUTE
│   └── "/loading" → LoadingScreen
│
├── PROTECTED ROUTES (requieren autenticación)
│   └── "/dashboard" → ProtectedRoute → Dashboard
│
└── CATCH ALL
    └── "*" → Navigate to "/"
```

## 5. Gestión de Estado Global (Context)

```
AuthContext
├── Propiedades:
│   ├── user: {
│   │   ├── id: number
│   │   ├── name: string
│   │   └── email: string
│   ├── isAuthenticated: boolean
│   └── isLoading: boolean
│
└── Métodos:
    ├── login(userData)
    │   └── Simula autenticación + API call
    │
    ├── register(userData)
    │   └── Simula registro + API call
    │
    └── logout()
        └── Limpia estado + localStorage
```

## 6. Validaciones en Formularios

### LoginPage
```
├── Email
│   ├── ✓ Requerido
│   ├── ✓ Formato válido (@)
│   └── ✗ Muestra error si falla
│
└── Contraseña
    ├── ✓ Requerido
    ├── ✓ Mínimo 6 caracteres
    └── ✗ Muestra error si falla
```

### RegisterPage
```
├── Nombre
│   ├── ✓ Requerido
│   ├── ✓ Mínimo 3 caracteres
│   └── ✗ Muestra error si falla
│
├── Email
│   ├── ✓ Requerido
│   ├── ✓ Formato válido
│   └── ✗ Muestra error si falla
│
├── Contraseña
│   ├── ✓ Requerido
│   ├── ✓ Mínimo 6 caracteres
│   └── ✗ Muestra error si falla
│
└── Confirmar Contraseña
    ├── ✓ Debe coincidir
    └── ✗ Muestra error si no coincide
```

## 7. Estilos CSS

```
GlobalStyles.css
├── Reset y base
├── Variables globales
├── Estilos de botones comunes
└── Scrollbar personalizado

LandingPage.css
├── Gradiente de fondo
├── Grid layout (desktop)
├── Tarjetas de características
├── Animación float
└── Media queries mobile

AuthPages.css (Login & Register)
├── Caja de formulario
├── Campos de entrada
├── Validación visual
├── Links y footer
└── Responsive design

LoadingScreen.css
├── Pantalla full
├── Spinner animado
├── Textos centrados
└── Animación spin

Dashboard.css
├── Layout flex
├── Navbar superior
├── Grid de tarjetas
├── Efectos hover
└── Responsive grid
```

## 8. Flujo de Datos

```
Usuario accede a "/"
        ↓
    LandingPage
        ↓
  Click en botón
        ↓
    LoginPage / RegisterPage
        ↓
  Envía formulario
        ↓
  AuthContext.login/register()
        ↓
  localStorage.setItem('user')
        ↓
  LoadingScreen (automático)
        ↓
  ProtectedRoute verifica
        ↓
  Dashboard (si está autenticado)
        ↓
  Cerrar sesión
        ↓
  localStorage.removeItem('user')
        ↓
  Redirige a LandingPage
```

## 9. Estados de Carga

```
Inicio
  ├── isLoading: true
  └── Verificar localStorage
       ├── Si existe user → isAuthenticated: true
       └── Si no existe → isAuthenticated: false
       └── Después 2s → isLoading: false

Login/Register
  ├── isLoading: true
  ├── Simular API (1.5s)
  ├── isLoading: false
  └── Redirige a "/loading"

Loading Screen
  ├── Espera isLoading = false
  └── Redirige a "/dashboard"

Logout
  ├── Limpia userData
  ├── isAuthenticated: false
  └── Redirige a "/"
```

---

Este diagrama muestra la arquitectura completa y cómo fluyen los datos a través de la aplicación. Todos los componentes están diseñados para ser mantenibles, escalables y fáciles de entender.

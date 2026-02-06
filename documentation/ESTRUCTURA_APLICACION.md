# Estructura de la Aplicación React TIKAL

## 📋 Descripción General

Esta es una aplicación React con una arquitectura completa que incluye:
- **Landing Page**: Página de inicio con información sobre la aplicación
- **Autenticación**: Formularios de Login y Registro
- **Pantalla de Carga**: Loading screen mientras se cargan los datos
- **Dashboard**: Panel principal de la aplicación (ruta protegida)

## 📁 Estructura de Carpetas

```
src/
├── components/
│   ├── layout/
│   │   └── ProtectedRoute.jsx          # Componente para rutas protegidas
│   ├── Square.jsx                      # (Componente existente del TicTacToe)
│   └── WinnerModal.jsx                 # (Componente existente del TicTacToe)
├── context/
│   └── AuthContext.jsx                 # Context para gestionar autenticación
├── hooks/
│   └── useAuth.js                      # Hook personalizado para usar AuthContext
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx               # Página de inicio de sesión
│   │   └── RegisterPage.jsx            # Página de registro
│   ├── Dashboard.jsx                   # Panel principal de la aplicación
│   ├── LandingPage.jsx                 # Página de inicio
│   └── LoadingScreen.jsx               # Pantalla de carga
├── styles/
│   ├── GlobalStyles.css                # Estilos globales
│   ├── LandingPage.css                 # Estilos de Landing Page
│   ├── AuthPages.css                   # Estilos para Login y Register
│   ├── LoadingScreen.css               # Estilos de pantalla de carga
│   └── Dashboard.css                   # Estilos del Dashboard
├── App.jsx                             # Configuración de rutas
├── main.jsx                            # Punto de entrada
└── index.css                           # Estilos base
```

## 🔄 Flujo de Navegación

```
Landing Page ("/")
├── → Iniciar Sesión → Login Page ("/login")
│                    └── Éxito → Loading Screen ("/loading") → Dashboard ("/dashboard")
│
└── → Registrarse → Register Page ("/register")
                   └── Éxito → Loading Screen ("/loading") → Dashboard ("/dashboard")

Dashboard ("/dashboard") [RUTA PROTEGIDA]
└── Cerrar Sesión → Landing Page ("/")
```

## 🛡️ Rutas Protegidas

El Dashboard está protegido por el componente `ProtectedRoute`, que:
- Verifica si el usuario está autenticado
- Redirige a login si no lo está
- Muestra la pantalla de carga mientras se verifica

## 🔐 Sistema de Autenticación

### AuthContext (`src/context/AuthContext.jsx`)
Proporciona:
- `user`: Información del usuario autenticado
- `isAuthenticated`: Boolean indicando si hay sesión activa
- `isLoading`: Boolean para pantalla de carga
- `login()`: Función para iniciar sesión
- `register()`: Función para registrarse
- `logout()`: Función para cerrar sesión

### useAuth Hook (`src/hooks/useAuth.js`)
Hook personalizado para acceder fácilmente al contexto de autenticación en cualquier componente.

## 📱 Características Principales

### Landing Page
- Introducción a la aplicación
- 4 características destacadas
- Botones para ir a Login o Register

### Login Page
- Validación de email y contraseña
- Mensajes de error
- Link a página de registro
- Estados de carga

### Register Page
- Validación de nombre, email y contraseña
- Confirmación de contraseña
- Mensajes de error
- Link a página de login
- Estados de carga

### Loading Screen
- Spinner animado
- Redirige automáticamente al dashboard cuando carga
- Simula 2 segundos de carga (configurable)

### Dashboard
- Barra de navegación con nombre de usuario
- Botón de cerrar sesión
- Grid de tarjetas para diferentes funcionalidades
- Interfaz responsiva

## 🎨 Diseño

- **Colores principales**: Gradiente purpura (#667eea a #764ba2)
- **Responsive**: Adaptado para mobile, tablet y desktop
- **Animaciones**: Efectos suaves de transición y hover
- **Tema moderno**: Glassmorphism y sombras sutiles

## 🚀 Cómo Usar

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

3. **Build para producción**:
   ```bash
   npm run build
   ```

## 🔄 Datos Persistentes

Los datos se almacenan en localStorage:
- `user`: Información del usuario autenticado
- `board` y `turn`: (Datos existentes del TicTacToe)

## 📝 Notas Importantes

- El sistema de autenticación es simulado (sin API real)
- Los datos se almacenan en localStorage (no persistente entre navegadores)
- Las contraseñas se validan en el cliente (requiere API en producción)
- El loading simula 1.5-2 segundos (ajustable)

## 🔧 Próximas Mejoras

- Integración con API real para autenticación
- Implementar más módulos en el Dashboard (Proyectos, Tareas, etc.)
- Agregar soporte para recuperación de contraseña
- Implementar 2FA (Two-Factor Authentication)
- Agregar más validaciones de seguridad
- Implementar refresh tokens

## 📦 Dependencias Principales

- `react`: ^19.1.0
- `react-dom`: ^19.1.0
- `react-router-dom`: ^6.20.0
- `canvas-confetti`: 1.9.3
- `vite`: ^7.0.0

---

**Estado**: Estructura completamente funcional y lista para ser integrada con un backend real.

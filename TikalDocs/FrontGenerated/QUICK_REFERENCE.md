# ⚡ QUICK REFERENCE - Guía Rápida

## 🚀 Start Rápido (30 segundos)

```bash
cd frontend
npm install
npm run dev
```

Abre: `http://localhost:5173`

---

## 📱 Flujo de Usuario

1. **Landing** → Click "Iniciar Sesión"
2. **Login** → Email + Contraseña ≥6 caracteres → Click "Iniciar Sesión"
3. **Loading** → (Automático)
4. **Dashboard** → ¡Autenticado! → Click "Cerrar Sesión" → Landing

---

## 🗂️ Ubicación de Archivos

| Qué busco | Dónde está |
|-----------|-----------|
| Página de inicio | `src/pages/LandingPage.jsx` |
| Login/Registro | `src/pages/auth/` |
| Lógica autenticación | `src/context/AuthContext.jsx` |
| Hook para auth | `src/hooks/useAuth.js` |
| Rutas protegidas | `src/components/layout/ProtectedRoute.jsx` |
| Estilos globales | `src/styles/GlobalStyles.css` |

---

## 💻 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Validar código
npm run lint

# Preview del build
npm run preview

# Limpiar todo
rm -rf node_modules && npm install
```

---

## 🎯 Usar useAuth en Componente

```jsx
import { useAuth } from '../hooks/useAuth'

export const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth()
  
  return (
    <div>
      <p>Hola {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## 📝 Validaciones de Formulario

### Login
- Email: requerido + formato válido
- Contraseña: requerida + ≥6 caracteres

### Register
- Nombre: requerido + ≥3 caracteres
- Email: requerido + formato válido
- Contraseña: requerida + ≥6 caracteres
- Confirmar: debe coincidir

---

## 🎨 Colores Principales

```
Purpura:  #667eea
Magenta:  #764ba2
Error:    #e74c3c
Success:  #27ae60
```

---

## 🔐 Cómo Agregar Ruta Protegida

```jsx
// En App.jsx
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { MiPagina } from './pages/MiPagina'

<Route
  path="/mipagina"
  element={
    <ProtectedRoute>
      <MiPagina />
    </ProtectedRoute>
  }
/>
```

---

## 📚 Documentación

| Documento | Para qué |
|-----------|----------|
| ESTRUCTURA_APLICACION.md | Entender la estructura |
| ARQUITECTURA_DETALLADA.md | Ver diagramas |
| GUIA_INSTALACION.md | Instalar y probar |
| INTEGRACION_API.md | Conectar con backend |
| EJEMPLOS_PRACTICOS.md | Ejemplos avanzados |

---

## 🔧 Variables de Entorno

Crear `.env.local`:
```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
```

Usar en código:
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

---

## 📊 Estado Global (AuthContext)

```javascript
{
  user: { id, name, email },    // Usuario actual
  isAuthenticated: boolean,      // ¿Está logueado?
  isLoading: boolean,            // ¿Cargando?
  login(userData),               // Función login
  register(userData),            // Función registro
  logout()                       // Función logout
}
```

---

## ⚠️ Mensajes de Error Comunes

| Error | Solución |
|-------|----------|
| "Cannot find module 'react-router-dom'" | Ejecuta `npm install` |
| Puerto 5173 ocupado | Cambia puerto en `vite.config.js` |
| localStorage vacío | Limpia cache: Ctrl+Shift+Delete |
| 401 Unauthorized (futuro) | Verifica token en localStorage |

---

## 🎓 Estructura Componentes

```jsx
// Componente típico con autenticación
import { useAuth } from '../hooks/useAuth'

export const MiComponente = () => {
  const { user, logout } = useAuth()

  return (
    <div>
      {/* Usar user y logout */}
    </div>
  )
}
```

---

## 🔄 Ciclo de Vida Autenticación

```
1. App carga → AuthContext verifica localStorage
2. Si existe user → isAuthenticated = true
3. Si no existe → isAuthenticated = false
4. Usuario hace login → AuthContext.login()
5. Se guarda en localStorage
6. isAuthenticated = true → Redirige a dashboard
7. Usuario hace logout → Se limpia localStorage
8. isAuthenticated = false → Redirige a login
```

---

## 📱 Responsive Design

- **Desktop (>768px)**: Full layout
- **Tablet (600-768px)**: Optimizado
- **Mobile (<600px)**: Stack vertical

---

## 🧪 Testing en Navegador

Abre Developer Tools (F12):

```javascript
// Ver usuario logueado
JSON.parse(localStorage.getItem('user'))

// Limpiar storage
localStorage.clear()

// Ver token (cuando esté implementado)
localStorage.getItem('token')
```

---

## 🎯 Checklist para Empezar

- [ ] Clonar/descargar proyecto
- [ ] Abrir carpeta `frontend`
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run dev`
- [ ] Abrir navegador en http://localhost:5173
- [ ] Probar el flujo de login/registro
- [ ] Revisar documentación

---

## 🚀 Próximos Pasos

1. **Integrar API Real**
   → Ver `INTEGRACION_API.md`

2. **Agregar Módulos**
   → Ver `EJEMPLOS_PRACTICOS.md`

3. **Personalizar Estilos**
   → Editar archivos en `src/styles/`

4. **Expandir Funcionalidades**
   → Seguir patrones existentes

---

## 📞 Referencia Rápida de Archivos

### Componentes
- **LandingPage.jsx** - 60 líneas
- **LoginPage.jsx** - 90 líneas
- **RegisterPage.jsx** - 100 líneas
- **Dashboard.jsx** - 60 líneas
- **LoadingScreen.jsx** - 30 líneas

### Lógica
- **AuthContext.jsx** - 70 líneas
- **useAuth.js** - 12 líneas
- **ProtectedRoute.jsx** - 30 líneas

### Estilos
- **GlobalStyles.css** - 50 líneas
- **LandingPage.css** - 100 líneas
- **AuthPages.css** - 90 líneas
- **LoadingScreen.css** - 40 líneas
- **Dashboard.css** - 100 líneas

---

## 🎨 Personalización Rápida

### Cambiar color principal
Edita en `GlobalStyles.css`:
```css
background: linear-gradient(135deg, #NUEVO 0%, #NUEVO2 100%);
```

### Cambiar tiempo de carga
Edita en `AuthContext.jsx`:
```javascript
setTimeout(() => { ... }, 2000)  // Cambiar 2000 por tu valor
```

### Cambiar validaciones
Edita en `src/pages/auth/LoginPage.jsx` y `RegisterPage.jsx`

---

## 💡 Tips Útiles

- Usa DevTools para inspeccionar componentes
- Usa React DevTools extension para ver estado
- Limpia localStorage para resetear sesión
- Usa console.log() para debugging
- Revisa la consola del navegador para errores

---

## 🎓 Ejemplos de Uso

### Renderizar si está autenticado
```jsx
{isAuthenticated && <Dashboard />}
```

### Obtener nombre del usuario
```jsx
<h1>Hola {user?.name}</h1>
```

### Redirigir en logout
```jsx
const handleLogout = () => {
  logout()
  navigate('/')
}
```

---

**¡Listo para empezar!** 🚀

Ejecuta `npm run dev` y comienza a explorar la aplicación.

---

Última actualización: 21 de Enero de 2026

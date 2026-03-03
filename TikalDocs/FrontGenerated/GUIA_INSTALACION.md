# 🚀 Guía de Instalación y Uso

## Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn

## 📦 Instalación

### 1. Instalar dependencias

```bash
# Desde la carpeta frontend
cd frontend

# Instalar todas las dependencias
npm install
```

### 2. Verificar instalación

```bash
# Listar las dependencias instaladas
npm list
```

Deberías ver:
```
frontend@0.0.0
├── canvas-confetti@1.9.3
├── react@19.1.0
├── react-dom@19.1.0
└── react-router-dom@6.20.0
```

## 🏃 Ejecutar la Aplicación

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Modo Producción

```bash
# Build
npm run build

# Preview del build
npm run preview
```

## 🧪 Validación de Código

```bash
# Ejecutar ESLint
npm run lint

# Ejecutar ESLint con fix automático
npm run lint -- --fix
```

## 📋 Flujo de Prueba Recomendado

### 1. Landing Page
- URL: `http://localhost:5173/`
- Verifica que se carguen los 4 features
- Prueba los botones "Iniciar Sesión" y "Registrarse"

### 2. Login
- Accede a: `http://localhost:5173/login`
- Prueba validaciones:
  - Email vacío → error
  - Email inválido (sin @) → error
  - Contraseña vacía → error
  - Contraseña < 6 caracteres → error
- Login correcto:
  - Email: cualquier email válido
  - Contraseña: cualquier contraseña ≥ 6 caracteres
  - Debería ir a Loading Screen → Dashboard

### 3. Register
- Accede a: `http://localhost:5173/register`
- Prueba validaciones:
  - Nombre < 3 caracteres → error
  - Email inválido → error
  - Contraseña < 6 caracteres → error
  - Contraseñas no coinciden → error
- Registro correcto:
  - Completa todos los campos
  - Debería ir a Loading Screen → Dashboard

### 4. Loading Screen
- URL: `http://localhost:5173/loading`
- Verifica spinner animado
- Espera a que se redirija automáticamente a dashboard (2s)

### 5. Dashboard (Ruta Protegida)
- URL: `http://localhost:5173/dashboard`
- Verifica que se muestre el nombre del usuario
- Prueba botón "Cerrar Sesión" → debe ir a Landing Page
- Directamente desde URL sin autenticación → debería redirigir a login

### 6. Rutas Dinámicas
- Intenta acceder a URL no existente: `http://localhost:5173/noexiste`
- Debería redirigir a Landing Page

## 🔧 Estructura de Comandos

```json
{
  "scripts": {
    "dev": "vite",                    // Ejecutar en desarrollo
    "build": "vite build",            // Build para producción
    "lint": "eslint .",               // Validar código
    "preview": "vite preview"         // Preview del build
  }
}
```

## 💾 Almacenamiento Local

La aplicación usa `localStorage` para guardar:

```javascript
localStorage.getItem('user')  // { id, name, email }
localStorage.getItem('board') // Tablero del TicTacToe (existente)
localStorage.getItem('turn')  // Turno actual (existente)
```

**Limpiar localStorage**:
```javascript
// En la consola del navegador
localStorage.clear()
```

## 🐛 Debugging

### Ver estado global (en la consola del navegador)

```javascript
// Inspeccionar usuario actual
const user = localStorage.getItem('user')
console.log(JSON.parse(user))
```

### Habilitar strict mode de React

Ya está habilitado en `main.jsx`. Esto ayuda a detectar problemas durante desarrollo.

## 📝 Variables de Entorno (Futuro)

Cuando integres con API real, crea un archivo `.env`:

```env
VITE_API_URL=https://api.tikal.com
VITE_API_PORT=8080
```

Y accede en el código:
```javascript
const API_URL = import.meta.env.VITE_API_URL
```

## 🎨 Personalización de Estilos

Los colores principales están en `GlobalStyles.css`:

```css
/* Cambiar gradiente */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cambiar colores de botones */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

## 🚀 Optimizaciones para Producción

Antes de hacer deploy:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Verificar carpeta `dist/`**:
   - Contiene los archivos optimizados
   - Debe estar en `.gitignore`

3. **Minificación**:
   - Vite lo hace automáticamente
   - Los archivos CSS y JS estarán comprimidos

4. **Source maps**:
   - Para debugging en producción (opcional)
   - Se pueden desactivar en `vite.config.js`

## 📱 Responsive Design

La aplicación es responsive:
- **Desktop**: Grid de 2 columnas (landing)
- **Tablet**: Grid de 1-2 columnas
- **Mobile**: Grid de 1 columna, layout flex adaptado

Prueba con:
```
F12 → Modo responsive (Ctrl+Shift+M en Firefox)
```

## ⚠️ Notas Importantes

1. **Autenticación simulada**: El login no usa API real
2. **Sin base de datos**: Los datos se pierden al refrescar (localStorage)
3. **Sin validación de servidor**: Todas las validaciones son en cliente
4. **Sin JWT**: No hay tokens de seguridad real

## 🔄 Próximas Fases

Para integración con backend:

1. Reemplaza `AuthContext.login()` con llamadas a API real
2. Implementa manejo de errores desde servidor
3. Agrega JWT tokens para autenticación segura
4. Implementa refresh tokens
5. Agrega interceptores de API

## 📚 Recursos Útiles

- [React Router v6 Docs](https://reactrouter.com/)
- [React Context API](https://react.dev/reference/react/useContext)
- [Vite Documentation](https://vitejs.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)

## ✅ Checklist de Verificación

- [ ] npm install ejecutado correctamente
- [ ] npm run dev funciona
- [ ] Landing page carga en localhost:5173
- [ ] Validaciones de formularios funcionan
- [ ] Login/Register redirige a loading
- [ ] Dashboard muestra usuario autenticado
- [ ] Logout redirige a landing
- [ ] Rutas protegidas funcionan
- [ ] Responsive design funciona en mobile

---

**¿Problemas?** 
- Limpia node_modules: `rm -rf node_modules && npm install`
- Limpia cache: `npm cache clean --force`
- Usa versión LTS de Node.js

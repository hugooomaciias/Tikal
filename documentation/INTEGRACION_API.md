# 🔌 Guía de Integración con API

## Descripción General

Este documento explica cómo integrar la aplicación React con un backend API real (como el servidor Java de TIKAL).

## 📋 Cambios en AuthContext

### Versión Actual (Simulada)

```jsx
const login = (userData) => {
  setIsLoading(true)
  setTimeout(() => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsLoading(false)
  }, 1500)
}
```

### Con API Real

```jsx
const login = async (email, password) => {
  setIsLoading(true)
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error('Login fallido')
    }

    const data = await response.json()
    
    setUser(data.user)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('token', data.token)
    
    setIsLoading(false)
  } catch (error) {
    setError(error.message)
    setIsLoading(false)
  }
}
```

## 🔑 Manejo de Tokens JWT

### Almacenamiento de Token

```jsx
// En AuthContext
const [token, setToken] = useState(null)

// Después de login exitoso
localStorage.setItem('token', data.token)
setToken(data.token)
```

### Usar Token en Requests

```jsx
// Crear cliente HTTP reutilizable
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  return response.json()
}
```

## 📝 Cambios en LoginPage

### Antes (Local)

```jsx
const handleSubmit = (e) => {
  e.preventDefault()
  const newErrors = validateForm()
  
  if (Object.keys(newErrors).length === 0) {
    login({
      email: formData.email,
      id: Math.random(),
      name: formData.email.split('@')[0]
    })
  }
}
```

### Después (Con API)

```jsx
const [serverError, setServerError] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  const newErrors = validateForm()
  
  if (Object.keys(newErrors).length === 0) {
    try {
      await login(formData.email, formData.password)
      navigate('/loading')
    } catch (error) {
      setServerError(error.message || 'Error al iniciar sesión')
    }
  } else {
    setErrors(newErrors)
  }
}
```

## 📦 Crear Servicio API Centralizado

### `src/services/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  return headers
}

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error en login')
    }
    
    return response.json()
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error en registro')
    }
    
    return response.json()
  },

  logout: async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getHeaders()
    })
  }
}

export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Error al obtener perfil')
    }
    
    return response.json()
  }
}

export const projectAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error('Error al obtener proyectos')
    }
    
    return response.json()
  }
}
```

## 🔄 Uso de Servicios en AuthContext

```jsx
import { authAPI } from '../services/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          const userData = await userAPI.getProfile()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await authAPI.login(email, password)
      
      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      setIsLoading(false)
      return data
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
      throw error
    }
  }

  const register = async (name, email, password) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await authAPI.register(name, email, password)
      
      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('token', data.token)
      
      setIsLoading(false)
      return data
    } catch (error) {
      setError(error.message)
      setIsLoading(false)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Error en logout:', error)
    }
    
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
```

## 🔐 Interceptor de Errores 401

Para manejar tokens expirados:

```jsx
// En src/services/api.js

export const createAuthenticatedFetch = () => {
  return async (url, options = {}) => {
    const token = localStorage.getItem('token')
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    let response = await fetch(url, { ...options, headers })
    
    // Si obtenes 401, el token expiró
    if (response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return
    }
    
    return response
  }
}
```

## 🌐 Variables de Entorno

### `.env` (Ejemplo)

```env
VITE_API_URL=http://localhost:8080
VITE_ENV=development
```

### Acceder en código

```javascript
const API_URL = import.meta.env.VITE_API_URL
const ENV = import.meta.env.VITE_ENV

console.log(`Conectando a ${API_URL} en modo ${ENV}`)
```

## 📱 Endpoint Esperados del Backend

Asume estos endpoints en tu API Java:

```
POST /api/auth/login
  Body: { email, password }
  Response: { user: { id, name, email }, token }

POST /api/auth/register
  Body: { name, email, password }
  Response: { user: { id, name, email }, token }

POST /api/auth/logout
  Headers: Authorization: Bearer <token>
  Response: { message: "Logged out" }

GET /api/user/profile
  Headers: Authorization: Bearer <token>
  Response: { id, name, email, ... }

GET /api/projects
  Headers: Authorization: Bearer <token>
  Response: [{ id, name, ... }]
```

## ✅ Checklist de Integración

- [ ] Crear `src/services/api.js`
- [ ] Instalar cliente HTTP (fetch API ya incluido)
- [ ] Crear variables de entorno `.env`
- [ ] Actualizar `AuthContext` para usar API
- [ ] Actualizar `LoginPage` y `RegisterPage`
- [ ] Agregar manejo de errores
- [ ] Agregar manejo de tokens
- [ ] Agregar interceptores para 401
- [ ] Probar autenticación completa
- [ ] Documentar endpoints

## 🧪 Testing con Postman/Insomnia

Ejemplos de requests:

### Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Usar Token
```
GET http://localhost:8080/api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚨 Manejo de Errores

```javascript
try {
  await login(email, password)
} catch (error) {
  if (error.message.includes('401')) {
    // Usuario no autorizado
  } else if (error.message.includes('500')) {
    // Error del servidor
  } else {
    // Otro error
  }
}
```

---

Esta guía facilita la transición de autenticación simulada a autenticación real con tu backend.

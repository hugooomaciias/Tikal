# 🎓 Ejemplos Prácticos de Uso

## 1. Crear un Nuevo Componente en el Dashboard

### Crear archivo `src/pages/Projects.jsx`

```jsx
import { useAuth } from '../hooks/useAuth'
import '../styles/Projects.css'

export const Projects = () => {
  const { user } = useAuth()

  const projects = [
    { id: 1, name: 'TIKAL', status: 'En progreso' },
    { id: 2, name: 'Dashboard', status: 'Completado' },
    { id: 3, name: 'API REST', status: 'Planificación' }
  ]

  return (
    <div className="projects-page">
      <h2>Mis Proyectos</h2>
      <p>Usuario: {user?.name}</p>
      
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <h3>{project.name}</h3>
            <span className={`status ${project.status.toLowerCase()}`}>
              {project.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Agregar ruta en `src/App.jsx`

```jsx
import { Projects } from './pages/Projects'

<Route
  path="/projects"
  element={
    <ProtectedRoute>
      <Projects />
    </ProtectedRoute>
  }
/>
```

---

## 2. Agregar Servicio de API

### Crear `src/services/projectAPI.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const projectAPI = {
  // Obtener todos los proyectos
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: getHeaders()
      })
      
      if (!response.ok) throw new Error('Error fetching projects')
      return response.json()
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // Obtener proyecto por ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        headers: getHeaders()
      })
      
      if (!response.ok) throw new Error('Project not found')
      return response.json()
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // Crear proyecto
  create: async (projectData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) throw new Error('Error creating project')
      return response.json()
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // Actualizar proyecto
  update: async (id, projectData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(projectData)
      })
      
      if (!response.ok) throw new Error('Error updating project')
      return response.json()
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  // Eliminar proyecto
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      
      if (!response.ok) throw new Error('Error deleting project')
      return response.json()
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
```

---

## 3. Usar el Servicio en un Componente

### Actualizar `src/pages/Projects.jsx`

```jsx
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { projectAPI } from '../services/projectAPI'
import '../styles/Projects.css'

export const Projects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectAPI.getAll()
      setProjects(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await projectAPI.delete(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      setError(error.message)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="projects-page">
      <h2>Mis Proyectos</h2>
      
      {projects.length === 0 ? (
        <p>No tienes proyectos</p>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="project-actions">
                <button onClick={() => handleDelete(project.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 4. Crear un Hook Personalizado

### Crear `src/hooks/useProjects.js`

```javascript
import { useState, useEffect } from 'react'
import { projectAPI } from '../services/projectAPI'

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectAPI.getAll()
      setProjects(data)
      setError(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData) => {
    try {
      const newProject = await projectAPI.create(projectData)
      setProjects([...projects, newProject])
      return newProject
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const updateProject = async (id, projectData) => {
    try {
      const updated = await projectAPI.update(id, projectData)
      setProjects(projects.map(p => p.id === id ? updated : p))
      return updated
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const deleteProject = async (id) => {
    try {
      await projectAPI.delete(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  }
}
```

### Usar el Hook

```jsx
export const Projects = () => {
  const { projects, loading, error, deleteProject } = useProjects()

  // Ahora el componente es más simple
  return (
    <div className="projects-page">
      {/* ... */}
    </div>
  )
}
```

---

## 5. Agregar Notificaciones/Toast

### Crear `src/hooks/useNotification.js`

```javascript
import { useState, useCallback } from 'react'

export const useNotification = () => {
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type })
    
    if (duration) {
      setTimeout(() => setNotification(null), duration)
    }
  }, [])

  const success = useCallback((message) => {
    showNotification(message, 'success')
  }, [showNotification])

  const error = useCallback((message) => {
    showNotification(message, 'error')
  }, [showNotification])

  const info = useCallback((message) => {
    showNotification(message, 'info')
  }, [showNotification])

  const closeNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return { notification, showNotification, success, error, info, closeNotification }
}
```

### Usar en componente

```jsx
export const Projects = () => {
  const { success, error } = useNotification()

  const handleDelete = async (id) => {
    try {
      await projectAPI.delete(id)
      success('Proyecto eliminado correctamente')
    } catch (err) {
      error('Error al eliminar proyecto')
    }
  }

  return (
    // ...
  )
}
```

---

## 6. Middleware de Autenticación

### Crear `src/middleware/auth.js`

```javascript
export const checkTokenExpiry = () => {
  const token = localStorage.getItem('token')
  const expiryTime = localStorage.getItem('tokenExpiry')

  if (!token || !expiryTime) return false

  const now = new Date().getTime()
  if (now > parseInt(expiryTime)) {
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpiry')
    return false
  }

  return true
}

export const setTokenExpiry = (expiresIn = 3600) => {
  const expiryTime = new Date().getTime() + expiresIn * 1000
  localStorage.setItem('tokenExpiry', expiryTime)
}
```

### Usar en AuthContext

```jsx
useEffect(() => {
  const token = localStorage.getItem('token')
  
  if (token && !checkTokenExpiry()) {
    logout()
    navigate('/login')
  }
}, [])
```

---

## 7. Configurar Variables de Entorno

### Crear `.env.local`

```env
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_LOG_LEVEL=debug
```

### Crear `src/config/api.js`

```javascript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  retries: 3,
  retryDelay: 1000
}

export const ENV = import.meta.env.VITE_ENV || 'development'
export const IS_DEV = ENV === 'development'
```

---

## 8. Agregar Testing Básico

### Crear `src/__tests__/auth.test.jsx`

```javascript
// Ejemplo con Vitest (framework que viene con Vite)

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('debe retornar contexto de autenticación', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toBeDefined()
  })

  it('debe tener isAuthenticated como false inicialmente', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

---

## 9. Logger de Debugging

### Crear `src/utils/logger.js`

```javascript
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString()
  const log = { timestamp, level, message }
  
  if (data) log.data = data
  
  console.log(`[${timestamp}] [${level}] ${message}`, data || '')
}

export const logger = {
  debug: (msg, data) => log(LOG_LEVELS.DEBUG, msg, data),
  info: (msg, data) => log(LOG_LEVELS.INFO, msg, data),
  warn: (msg, data) => log(LOG_LEVELS.WARN, msg, data),
  error: (msg, data) => log(LOG_LEVELS.ERROR, msg, data)
}
```

### Usar en código

```javascript
import { logger } from '../utils/logger'

const fetchProjects = async () => {
  try {
    logger.debug('Fetching projects...')
    const data = await projectAPI.getAll()
    logger.info('Projects fetched successfully', { count: data.length })
  } catch (error) {
    logger.error('Error fetching projects', error)
  }
}
```

---

## 10. Formulario Dinámico Reutilizable

### Crear `src/components/DynamicForm.jsx`

```jsx
import { useState } from 'react'

export const DynamicForm = ({ fields, onSubmit, submitText = 'Enviar' }) => {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar
    const newErrors = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} es requerido`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Enviar
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields.map(field => (
        <div key={field.name} className="form-group">
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
          />
          {errors[field.name] && <span className="error">{errors[field.name]}</span>}
        </div>
      ))}
      <button type="submit">{submitText}</button>
    </form>
  )
}
```

### Usar

```jsx
<DynamicForm
  fields={[
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true }
  ]}
  onSubmit={handleCreateProject}
  submitText="Crear Proyecto"
/>
```

---

## 📚 Recursos Adicionales

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite Guide](https://vitejs.dev)
- [REST API Best Practices](https://restfulapi.net)
- [JavaScript Fetch API](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)

---

**Estos ejemplos te muestran cómo extender la aplicación base creada. Úsalos como referencia para agregar nuevas funcionalidades.**

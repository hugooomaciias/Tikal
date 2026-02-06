import { createContext, useState, useEffect } from 'react'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simular carga de usuario desde localStorage o API
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      }
      // Simular tiempo de carga
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
    }

    checkAuth()
  }, [])

  const login = (userData) => {
    setIsLoading(true)
    // Simular llamada a API
    setTimeout(() => {
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      setIsLoading(false)
    }, 1500)
  }

  const register = (userData) => {
    setIsLoading(true)
    // Simular llamada a API
    setTimeout(() => {
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      setIsLoading(false)
    }, 1500)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

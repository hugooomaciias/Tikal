import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LoadingScreen = () => {
  const navigate = useNavigate()
  const { isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      navigate('/dashboard')
    }
  }, [isLoading, navigate])

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
      <div className="text-center">
        {/* Spinner Animation */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-white border-opacity-30 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3">Cargando tu aplicación...</h2>
        <p className="text-white text-opacity-80 text-lg">Por favor espera mientras preparamos tu sesión</p>
      </div>
    </div>
  )
}

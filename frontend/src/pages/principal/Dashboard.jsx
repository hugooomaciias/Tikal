import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const features = [
    { icon: '📊', title: 'Proyectos', description: 'Gestiona tus proyectos activos' },
    { icon: '👥', title: 'Equipos', description: 'Administra tus equipos de trabajo' },
    { icon: '✅', title: 'Tareas', description: 'Controla las tareas pendientes' },
    { icon: '⏱️', title: 'Tiempo', description: 'Registra tu tiempo de trabajo' },
    { icon: '🎮', title: 'Ranking', description: 'Consulta los rankings de tu equipo' },
    { icon: '💬', title: 'Mensajes', description: 'Comunícate con tu equipo' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TIKAL
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">
              Bienvenido, {user?.name || 'Usuario'}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-logout px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Panel Principal</h2>
          <p className="text-gray-600 text-lg">
            Aquí es donde irá el contenido principal de tu aplicación TIKAL.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {feature.icon} {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

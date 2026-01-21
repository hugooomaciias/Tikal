import { useNavigate } from 'react-router-dom'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl w-full items-center">
            {/* Contenido izquierdo */}
            <div className="text-white">
                <h1 className="text-5xl font-bold mb-4 leading-tight">
                    Bienvenido a TIKAL
                </h1>
                <p className="text-xl mb-8 opacity-90">
                    La plataforma completa para gestionar tus proyectos y equipos
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold mb-2">Dashboard Intuitivo</h3>
                        <p className="text-sm opacity-80">
                            Visualiza el progreso de tus proyectos en tiempo real
                        </p>
                    </div>

                    <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-4">👥</div>
                        <h3 className="text-lg font-semibold mb-2">Colaboración en Equipo</h3>
                        <p className="text-sm opacity-80">
                            Trabaja junto a tu equipo de forma organizada
                        </p>
                    </div>

                    <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-4">⏱️</div>
                        <h3 className="text-lg font-semibold mb-2">Gestión de Tiempo</h3>
                        <p className="text-sm opacity-80">
                            Registra y controla el tiempo de tus tareas
                        </p>
                    </div>

                    <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-xl border border-white border-opacity-20">
                        <div className="text-5xl mb-4">🎮</div>
                        <h3 className="text-lg font-semibold mb-2">Gamificación</h3>
                        <p className="text-sm opacity-80">
                            Obtén rangos y recompensas por tus logros
                        </p>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 flex-col sm:flex-row">
                    <button
                    className="btn btn-primary"
                    onClick={() => navigate('/login')}
                    >
                    Iniciar Sesión
                    </button>
                    <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/register')}
                    >
                    Registrarse
                    </button>
                </div>
            </div>

            {/* Imagen derecha */}
            <div className="hidden lg:flex justify-center items-center">
                <div className="w-80 h-80 bg-white bg-opacity-10 rounded-3xl flex items-center justify-center backdrop-blur-xl border-2 border-white border-opacity-20">
                    <div className="text-9xl animate-float">⏱️</div>
                </div>
            </div>
        </div>
    </div>
  )
}

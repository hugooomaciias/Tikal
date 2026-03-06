import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { LandingPage } from './pages/landing/LandingPage'
import { PaymentPage } from './pages/landing/PaymentPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { LoadingScreen } from './pages/LoadingScreen'
import { Home } from './pages/main/HomePage'
import { PublicRoute } from './components/auth/PublicRoute.jsx'

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					{/* Ruta pública - Landing Page */}
					<Route path="/" element={<LandingPage />} />
					<Route path="/payment" element={<PaymentPage />} />

					{/* Rutas de autenticación */}
					<Route element={<PublicRoute />}>
						<Route path="/login" element={<LoginPage />} />
						<Route path="/register" element={<RegisterPage />} />
					</Route>

					<Route path="/forgot-password" element={<ForgotPasswordPage />} />

					{/* Ruta de carga */}
					<Route path="/loading" element={<LoadingScreen />} />

					{/* Rutas protegidas */}
					<Route
						path="/home"
						element={
						<ProtectedRoute>
							<Home />
						</ProtectedRoute>
						}
					/>

					{/* Redireccionar rutas desconocidas a landing */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</AuthProvider>
		</Router>
	)
}

export default App

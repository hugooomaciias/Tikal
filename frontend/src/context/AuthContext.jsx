import { createContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import { useNavigate } from 'react-router-dom'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext()
/**
 * Authentication Provider Component
 *
 * Manages the user state, handles login, registration, logout, and securely
 * fetches and refreshes JWT access tokens upon application load.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 */
export const AuthProvider = ({ children }) => {
	/**
	 * User State
	 *
	 * Stores the currently authenticated user's information.
	 */
	const [user, setUser] = useState(null)

	/**
	 * Authentication State
	 *
	 * Flag indicating whether there is an active valid session.
	 */
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	/**
	 * Loading State
	 *
	 * Indicates if the application is currently verifying the stored token
	 * on initial load. Usually prevents the main app from rendering until finished.
	 */
	const [isLoading, setIsLoading] = useState(true)

	const navigate = useNavigate()

	/**
	 * Initial Authentication Check Effect
	 *
	 * Runs once when the AuthProvider mounts. Checks `localStorage` for an `accessToken`.
	 * If present, it securely decodes it, checking the expiration time (`exp`).
	 * If expired, it automatically attempts to use the `refreshToken` to acquire
	 * a new access token before marking the user as authenticated.
	 */
	useEffect(() => {
		const checkAuth = async () => {
			const token = localStorage.getItem('accessToken')

			if (! token) {
				setIsLoading(false)
                return
			}

			try {
				const base64Url = token.split('.')[1]
				const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
				const jsonPayload = decodeURIComponent(
					atob(base64)
						.split('')
						.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
						.join('')
				)

				const decoded = JSON.parse(jsonPayload)
				
				const isExpired = decoded.exp && (decoded.exp * 1000 < Date.now())

				if (isExpired) {
					const refreshToken = localStorage.getItem('refreshToken')

					if (refreshToken) {
						const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
							method: 'POST',
							headers: { 'Authorization': `Bearer ${refreshToken}` }
						})

						const text = await response.text()
						const data = text ? JSON.parse(text) : {}

						if (response.ok) {
							console.log('Token refrescado correctamente')

							localStorage.setItem('accessToken', data.access_token)
							localStorage.setItem('refreshToken', data.refresh_token)

							setUser({ identifier: decoded.sub })
							setIsAuthenticated(true)

						} else {
							localStorage.removeItem('accessToken')
							localStorage.removeItem('refreshToken')
							setIsAuthenticated(false)

							navigate('/login', {
								state: { setApiError: 'La sesión ha expirado. Por favor, inicia sesión de nuevo' }
							})
						}
					}

				} else {
					setUser({ identifier: decoded.sub })
					setIsAuthenticated(true)
				}

			} catch (error) {
				console.error('Error validando la sesión', error)

				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				setIsAuthenticated(false)

			} finally {
				setIsLoading(false)
			}
		}

		checkAuth()
	}, [])

	/**
	 * Executes the login flow.
	 *
	 * Sends credentials to the backend. On success, securely saves the newly
	 * acquired access and refresh tokens in `localStorage` and updates context state.
	 *
	 * @async
	 * @function
	 * @param {Object} userData - User credentials.
	 * @param {string} userData.identifier - The username or email of the user.
	 * @param {string} userData.password - The password of the user.
	 * @throws {Error} Throws an error if the login request fails.
	 */
	const login = async (userData) => {
		setIsLoading(true)

		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(userData)
			})

			const text = await response.text()
            const data = text ? JSON.parse(text) : {}

			if (response.ok) {
				localStorage.setItem('accessToken', data.access_token)
				localStorage.setItem('refreshToken', data.refresh_token)

				setUser({ identifier: userData.identifier })
				setIsAuthenticated(true)
			} else {
				throw new Error(data.message || 'Error en el login')
			}

		} catch (error) {
			console.error('Login error', error)
			throw error
			
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Executes the registration flow.
	 *
	 * Formats the user data, creates the account via the backend API, and then
	 * directly logs the user in by saving the issued tokens and updating state.
	 *
	 * @async
	 * @function
	 * @param {Object} userData - New user details.
	 * @param {string} userData.username - The chosen username.
	 * @param {string} userData.email - The chosen email address.
	 * @param {string} userData.password - The chosen password.
	 * @throws {Error} Throws an error if the registration request fails.
	 */
	const register = async (userData) => {
		setIsLoading(true)
		
		try {
            const registerPayload = {
                name: userData.username,
                email: userData.email,
                password: userData.password,
                subscriptionPlan: "GRATUITO"
            }

			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(registerPayload)
			})

			const text = await response.text();
			const data = text ? JSON.parse(text) : {};

			if (response.ok) {
				localStorage.setItem('accessToken', data.access_token)
                localStorage.setItem('refreshToken', data.refresh_token)

                setUser({ identifier: userData.email })
                setIsAuthenticated(true)
			} else {
				throw new Error(data.message)
			}

		} catch (error) {
			console.error('Register error', error)
			throw error

		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Executes the logout flow.
	 *
	 * Clears local state and removes authentication tokens from `localStorage`.
	 *
	 * @function
	 */
	const logout = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/logout`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({"refresh_token": localStorage.getItem('refreshToken')})
			})

			if (! response.ok) {
				throw new Error('Error al cerrar sesión')
			}

			setUser(null)
			setIsAuthenticated(false)

			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
		} catch (error) {
			console.error('Logout error', error)
			throw error
		}
	}

	/**
	 * Initiates the password recovery flow.
	 *
	 * Sends the user's email to the backend to request a password reset OTP.
	 *
	 * @async
	 * @function
	 * @param {string} userData - The email address of the user requesting the reset.
	 * @throws {Error} Throws an error if the request fails.
	 */
	const forgotPassword = async (userData) => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({"email": userData})
			})

			if (! response.ok) {
				throw new Error('Error al enviar el correo de recuperación')
			}

		} catch (error) {
			console.error('Forgot password error', error)
			throw error
		}
	}

	/**
	 * Verifies the password reset OTP.
	 *
	 * Sends the provided OTP code and user email to the backend for validation.
	 *
	 * @async
	 * @function
	 * @param {Object} userData - OTP verification details.
	 * @param {string} userData.email - The user's email address.
	 * @param {string} userData.otpCode - The 6-digit OTP code sent to the user.
	 * @throws {Error} Throws an error if the OTP validation fails.
	 */
	const verifyOTP = async (userData) => {
		try {
			const verifyOTPPayload = {
				email: userData.email,
				otpCode: userData.otpCode
			}

			const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(verifyOTPPayload)
			})

			const text = await response.text();

			if (! response.ok) {
				const data = text ? JSON.parse(text) : {};

				throw new Error(data.message)
			}
		} catch (error) {
			console.error('Verify OTP error', error)
			throw error
		}
	}

	/**
	 * Executes the password reset confirm flow.
	 *
	 * Sends the validated OTP, email, and the new password to the backend
	 * to successfully complete the password reset process.
	 *
	 * @async
	 * @function
	 * @param {Object} userData - Reset password details.
	 * @param {string} userData.email - The user's email address.
	 * @param {string} userData.otpCode - The validated 6-digit OTP code.
	 * @param {string} userData.password - The user's new password.
	 * @throws {Error} Throws an error if the password reset fails.
	 */
	const resetPassword = async (userData) => {
		try {
			const resetPasswordPayload = {
				email: userData.email,
				otpCode: userData.otpCode,
				newPassword: userData.password
			}

			const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(resetPasswordPayload)
			})

			if (! response.ok) {
				throw new Error('Error al restablecer la contraseña')
			}

		} catch (error) {
			console.error('Reset password error', error)
			throw error
		}
	}

	/**
	 * Executes the Google Login flow.
	 *
	 * Sends the Google-provided ID token to the backend for verification and authentication.
	 * On success, securely saves the newly acquired JWT access and refresh tokens in
	 * `localStorage` and updates the context state.
	 *
	 * @async
	 * @function
	 * @param {string} googleIdToken - The ID token provided by Google OAuth.
	 * @throws {Error} Throws an error if the Google login request fails.
	 */
	const googleLogin = async (googleIdToken) => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/google`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({"idToken": googleIdToken})
			})

			const text = await response.text()
            const data = text ? JSON.parse(text) : {}

			if (response.ok) {
				localStorage.setItem('accessToken', data.access_token)
				localStorage.setItem('refreshToken', data.refresh_token)

				setUser({ identifier: data.email })
				setIsAuthenticated(true)
			} else {
				throw new Error(data.message || 'Error en el login con Google')
			}

		} catch (error) {
			console.error('Google login error', error)
			throw error
		}
	}

	return (
		<AuthContext.Provider
			value={{ user, isAuthenticated, isLoading, login, register, logout, forgotPassword, verifyOTP, resetPassword, googleLogin }}
		>
			{children}
		</AuthContext.Provider>
	)
}
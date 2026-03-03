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
				headers: {
					'Content-Type': 'application/json'
				},
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
	const logout = () => {
		setUser(null)
		setIsAuthenticated(false)

		localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
	}

	return (
		<AuthContext.Provider
			value={{ user, isAuthenticated, isLoading, login, register, logout }}
		>
			{children}
		</AuthContext.Provider>
	)
}
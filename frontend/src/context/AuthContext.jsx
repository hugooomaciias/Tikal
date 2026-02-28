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

	const login = async (userData) => {
		setIsLoading(true)
		try {
			const response = await fetch(`/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			})
			if (response.ok) {
				const data = await response.json()
				localStorage.setItem('accessToken', data.accessToken)
				localStorage.setItem('refreshToken', data.refreshToken)
				// Assuming user data is not returned, or decode from token
				setUser({ identifier: userData.identifier }) 
				setIsAuthenticated(true)
			} else {
				const error = await response.json()
				throw new Error(error.message)
			}
		} catch (error) {
			console.error('Login error', error)
			throw error
		} finally {
			setIsLoading(false)
		}
	}

	const register = async (userData) => {
		setIsLoading(true)
		try {
			const response = await fetch(`/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			})

			if (response.ok) {
				// Directly login after successful registration
                const loginResponse = await fetch(`/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: userData.email, // or username if you have it
                        password: userData.password
                    })
                });

                if(loginResponse.ok) {
                    const data = await loginResponse.json();
                    localStorage.setItem('accessToken', data.accessToken)
                    localStorage.setItem('refreshToken', data.refreshToken)
                    setUser({ identifier: userData.email }) 
                    setIsAuthenticated(true)
                } else {
                    const error = await loginResponse.json()
                    throw new Error(error.message || 'Login failed after registration')
                }
			} else {
				const error = await response.json()
				throw new Error(error.message)
			}
		} catch (error) {
			console.error('Register error', error)
			throw error
		} finally {
			setIsLoading(false)
		}
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

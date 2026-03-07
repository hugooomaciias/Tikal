/** React & Third-Party Libraries */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'

/** Styles */
import './index.css'

/** Components */
import App from './App.jsx'

/**
 * Application Entry Point
 *
 * This file serves as the main entry point for the React application. It binds
 * the React component tree to the HTML DOM and initializes top-level providers.
 *
 * It wraps the `App` component with:
 * - `StrictMode` for highlighting potential problems during development.
 * - `GoogleOAuthProvider` to configure Google authentication services
 *   using the provided client ID across the entire application.
 */
createRoot(document.getElementById('root')).render(
	<StrictMode>
		<GoogleOAuthProvider clientId="739659559082-e76k38nsvls9208ti7c2999bb1ac7v29.apps.googleusercontent.com">
			<App />
		</GoogleOAuthProvider>
  </StrictMode>,
)
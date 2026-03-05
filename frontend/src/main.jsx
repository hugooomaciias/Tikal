import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<GoogleOAuthProvider clientId="739659559082-e76k38nsvls9208ti7c2999bb1ac7v29.apps.googleusercontent.com">
			<App />
		</GoogleOAuthProvider>
  </StrictMode>,
)

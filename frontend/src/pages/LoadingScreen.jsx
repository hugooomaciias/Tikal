import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Lottie from 'lottie-react'

import firstPartAnimation from '../assets/animations/firstPartAnimationLoadingScreen.json'
import secondPartAnimation from '../assets/animations/secondPartAnimationLoadingScreen.json'

/**
 * Loading Screen Component
 *
 * This component serves as an intermediary transition screen while the
 * application initializes or authenticates the user. It utilizes Lottie
 * animations to provide a highly polished, two-stage visual feedback experience:
 * a continuous loading state, followed by a brief success state before
 * programmatic navigation.
 *
 * @component
 * @returns {JSX.Element} The rendered loading screen with animated feedback.
 */
export const LoadingScreen = () => {
	/**
     * Hook for programmatic navigation.
     */
	const navigate = useNavigate()

	/**
     * Authentication Hook
     * 
     * Provides the 'isLoading' state to communicate with the Auth Context/API.
     */
	const { isLoading } = useAuth()

	/**
     * Reference to track the latest isLoading state
	 * 
     * We use a ref so the Lottie callback always reads the most recent value
     * without causing unnecessary re-renders or stale closure issues.
     */
    const isLoadingRef = useRef(isLoading)

	/**
     * State to control which phase of the animation is currently active.
     * False indicates phase 1 and True indicates phase 2.
     * @type {[boolean, function]}
     */
	const [showSecondPartAnimation, setShowSecondPartAnimation] = useState(false)

	/**
     * Athentication loading status effect
	 * 
     * Instead of navigating immediately when data is ready, it smoothly triggers 
     * the secondary phase of animation.
     */
	useEffect(() => {
		isLoadingRef.current = isLoading
	}, [isLoading])

	/**
     * Animation Phase One Handler
	 * 
     * Triggered every time the first animation finishes a loop.
     * Evaluates if the backend has finished loading. If so, it advances
     * to the second animation phase.
     */
	const handleFirstPhaseLoopComplete = () => {
        if (! isLoadingRef.current) {
            setShowSecondPartAnimation(true)
        }
    }

	/**
     * Animation Phase Two Handler
	 * 
     * Callback function triggered specifically by the Lottie component's `onComplete` prop.
     * It executes exactly when the second phase of animation reaches its final frame,
     * ensuring a seamless transition to the dashboard.
     */
	const handleAnimationComplete = () => {
		navigate('/dashboard')
	}

	return (
		<div className="min-h-screen bg-primary flex items-center justify-center">
			<div className="text-center">

				{/* Animation */}
				<div className="relative w-full h-full mx-auto mb-8 flex items-center justify-center">
					{! showSecondPartAnimation ? (
						<Lottie key="firstPhase" animationData={firstPartAnimation}
								loop={true} autoplay={true} onLoopComplete={handleFirstPhaseLoopComplete}
						/>
					) : (
						<Lottie key="secondPhase" animationData={secondPartAnimation}
								loop={false} autoplay={true} onComplete={handleAnimationComplete}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

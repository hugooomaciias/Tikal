/** React & Third-Party Libraries */
import { useEffect, useRef, useState } from "react";

/**
 * Constant Animation Speed
 *
 * Defines the uniform scrolling speed in pixels per second. This maintains
 * a constant visual velocity regardless of the overflow distance.
 */
const SPEED_PX_PER_SECOND = 25;

/**
 * Scrolling Text Component
 *
 * A specialized utility component that smoothly animates textual content back and forth (ping-pong)
 * when the text overflows its parent container. The animation is triggered either by user hover
 * on desktop devices, or it runs automatically on mobile viewports.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.text - The textual content to be rendered and potentially animated.
 * @param {string} [props.className] - Optional Tailwind CSS or custom classes to apply to the container.
 * @returns {JSX.Element} The rendered scrolling text container.
 */
export const ScrollingText = ({ text, className }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Container Reference
     *
     * References the outer bounding container to measure its maximum available width.
     */
    const containerRef = useRef(null);

    /**
     * Text Reference
     *
     * References the inner textual element to measure its actual unrestricted width.
     */
    const textRef = useRef(null);

    // --- 2. Local State ---

    /**
     * Hover State
     *
     * Tracks whether the user's cursor is currently hovering over the component.
     */
    const [isHovered, setIsHovered] = useState(false);

    /**
     * Mobile Viewport State
     *
     * Tracks if the current viewport is sized as a mobile device (< 768px).
     */
    const [isMobile, setIsMobile] = useState(false);

    /**
     * Scroll Distance State
     *
     * Stores the calculated overflowing pixels (plus a small buffer) that the text needs to traverse.
     * A value greater than 0 indicates an overflow condition.
     */
    const [scrollDist, setScrollDist] = useState(0);

    // --- 3. Derived Variables ---

    /**
     * Overflowing State Flag
     *
     * Determines if the text exceeds the container's boundaries based on the scroll distance.
     */
    const isOverflowing = scrollDist > 0;

    /**
     * Animation Duration
     *
     * Calculates the time (in seconds) required to traverse the scroll distance at a constant speed,
     * ensuring a minimum duration of 1.5 seconds for smoothness on shorter overflows.
     */
    const animationDuration = Math.max(scrollDist / SPEED_PX_PER_SECOND, 1.5);

    /**
     * Animation Trigger Flag
     *
     * Resolves whether the ping-pong animation should be actively running, requiring both an overflow
     * condition and an appropriate interaction context (hovered on desktop or always on mobile).
     */
    const shouldAnimate = isOverflowing && (isHovered || isMobile);

    // --- 4. Side Effects ---

    /**
     * Overflow Measurement Effect
     *
     * Calculates the required scroll distance when the component mounts, when the viewport resizes,
     * or when the textual content changes. Triggers a small timeout on mount to ensure the DOM is fully painted.
     */
    useEffect(() => {
        /**
         * Check Overflow Routine
         *
         * Measures the DOM nodes and updates the scroll distance state.
         *
         * @returns {void}
         */
        const checkOverflow = () => {
            setIsMobile(window.innerWidth < 768);

            if (containerRef.current && textRef.current) {
                const parentWidth = containerRef.current.clientWidth;
                const textWidth = textRef.current.scrollWidth;

                if (textWidth > parentWidth) {
                    const overflowPixels = textWidth - parentWidth + 8;
                    setScrollDist(overflowPixels);
                } else {
                    setScrollDist(0);
                }
            }
        };

        const timeoutId = setTimeout(checkOverflow, 50);
        window.addEventListener("resize", checkOverflow);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", checkOverflow);
        };
    }, [text]);

    // --- 5. Event Handlers & Functions ---

    /**
     * Mouse Enter Handler
     *
     * Activates the hover state, potentially triggering the animation if the text overflows.
     *
     * @returns {void}
     */
    const handleMouseEnter = () => setIsHovered(true);

    /**
     * Mouse Leave Handler
     *
     * Deactivates the hover state, halting the animation on desktop devices.
     *
     * @returns {void}
     */
    const handleMouseLeave = () => setIsHovered(false);

    // --- 6. Render ---

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden whitespace-nowrap flex items-center ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Dynamic CSS Keyframes Wrapper */}
            <style>{`
                @keyframes scroll-bounce {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(calc(-1 * var(--scroll-dist))); }
                }
            `}</style>

            {/* Measuring Base Text */}
            <span
                ref={textRef}
                className={`block w-full truncate transition-opacity duration-300 ${
                    shouldAnimate ? "opacity-0" : "opacity-100"
                }`}
            >
                {text}
            </span>

            {/* Animated Ping-Pong Overlay */}
            {isOverflowing && (
                <span
                    className={`absolute top-0 left-0 w-max transition-opacity duration-300 ${
                        shouldAnimate ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    style={{
                        "--scroll-dist": `${scrollDist}px`,
                        animation: shouldAnimate
                            ? `scroll-bounce ${animationDuration}s ease-in-out infinite alternate`
                            : "none",
                    }}
                >
                    {text}
                </span>
            )}
        </div>
    );
};

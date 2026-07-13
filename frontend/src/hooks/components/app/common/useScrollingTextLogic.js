/** React & Third-Party Libraries */
import { useEffect, useRef, useState, useMemo, useCallback } from "react";

/**
 * Constant Animation Speed
 *
 * Defines the uniform scrolling speed in pixels per second. This maintains
 * a constant visual velocity regardless of the overflow distance.
 */
const SPEED_PX_PER_SECOND = 25;

/**
 * Scrolling Text Logic Hook
 *
 * This Headless Component Hook abstracts all state management, layout measurements,
 * and interaction handlers for the `ScrollingText` component. It centralizes
 * overflow detection and animation calculations to keep the JSX purely visual.
 *
 * @hook
 * @param {string} text - The textual content to be displayed, watched for recalculations.
 * @returns {Object} A structured payload containing all necessary refs, state, derived data, and action handlers.
 */
export const useScrollingTextLogic = (text) => {
    // --- 1. DOM Refs & Layout State ---

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

    // --- 2. Local UI State ---

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

    // --- 3. Derived UI Data ---

    /**
     * Overflowing State Flag
     *
     * Memoized calculation determining if the text exceeds the container's boundaries
     * based on the scroll distance.
     */
    const isOverflowing = useMemo(() => scrollDist > 0, [scrollDist]);

    /**
     * Animation Duration
     *
     * Memoized calculation of the time (in seconds) required to traverse the scroll distance at a constant speed,
     * ensuring a minimum duration of 1.5 seconds for smoothness on shorter overflows.
     */
    const animationDuration = useMemo(() => Math.max(scrollDist / SPEED_PX_PER_SECOND, 1.5), [scrollDist]);

    /**
     * Animation Trigger Flag
     *
     * Memoized resolution of whether the ping-pong animation should be actively running, requiring both an overflow
     * condition and an appropriate interaction context (hovered on desktop or always on mobile).
     */
    const shouldAnimate = useMemo(() => isOverflowing && (isHovered || isMobile), [isOverflowing, isHovered, isMobile]);

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

    // --- 5. Interaction Handlers ---

    /**
     * Mouse Enter Handler
     *
     * Memoized to ensure referential stability. Activates the hover state,
     * potentially triggering the animation if the text overflows.
     *
     * @returns {void}
     */
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);

    /**
     * Mouse Leave Handler
     *
     * Memoized to ensure referential stability. Deactivates the hover state,
     * halting the animation on desktop devices.
     *
     * @returns {void}
     */
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    // --- 6. Return Object ---

    return {
        scrollingTextRefs: { containerRef, textRef },
        scrollingTextStates: { scrollDist },
        scrollingTextData: { isOverflowing, animationDuration, shouldAnimate },
        scrollingTextActions: { handleMouseEnter, handleMouseLeave },
    };
};

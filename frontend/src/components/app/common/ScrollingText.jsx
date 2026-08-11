/** Contexts, Hooks & Services */
import { useScrollingTextLogic } from "../../../hooks/components/app/common/useScrollingTextLogic.js";

/**
 * Scrolling Text Component
 *
 * A specialized purely visual component that smoothly animates textual content back and forth
 * (ping-pong) when the text overflows its parent container. The animation is triggered either
 * by user hover on desktop devices, or it runs automatically on mobile viewports.
 * It explicitly delegates all DOM measurement, overflow logic, and state management
 * to the `useScrollingTextLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.text - The textual content to be rendered and potentially animated.
 * @param {string} [props.className] - Optional Tailwind CSS or custom classes to apply to the container.
 * @returns {JSX.Element} The rendered scrolling text container.
 */
export const ScrollingText = ({ text, className }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * UI Data & Action Handlers
     *
     * Extracts DOM references, calculation states, derived overflow data, and interaction
     * handlers from the logic hook. Injects the `text` string to ensure the overflow
     * recalculates automatically if the textual content dynamically changes.
     */
    const { scrollingTextRefs, scrollingTextStates, scrollingTextData, scrollingTextActions } = useScrollingTextLogic(text);

    const { containerRef, textRef } = scrollingTextRefs;
    const { scrollDist } = scrollingTextStates;
    const { isOverflowing, animationDuration, shouldAnimate } = scrollingTextData;
    const { handleMouseEnter, handleMouseLeave } = scrollingTextActions;

    // --- 2. Render ---

    return (
        /* Main Overflow Container 
         * 🛡️ FIX: 'min-w-0' añadido. Fuerza al contenedor Flex a respetar los límites del padre
         * y no empujar el layout hacia la derecha.
         */
        <div
            ref={containerRef}
            className={`relative w-full min-w-0 overflow-hidden whitespace-nowrap flex items-center ${className}`}
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

            {/* Measuring Base Text 
             * 🛡️ FIX: 'min-w-0' añadido al span. Asegura que el truncate funcione 
             * correctamente dentro de un flex context.
             */ }
            <span
                ref={textRef}
                className={`block w-full min-w-0 truncate transition-opacity duration-300 ${
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

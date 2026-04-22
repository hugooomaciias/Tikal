/** React & Third-Party Libraries */
import { useEffect, useRef, useState } from "react";

export const ScrollingText = ({ text, className }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Guardamos los píxeles sobrantes
    const [scrollDist, setScrollDist] = useState(0);
    // Guardamos la duración calculada para mantener la velocidad constante
    const [animationDuration, setAnimationDuration] = useState(0);

    // Definimos la velocidad deseada en Píxeles por Segundo (ajústalo si lo quieres más rápido o lento)
    const SPEED_PX_PER_SECOND = 25;

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                const parentWidth = containerRef.current.clientWidth;
                const textWidth = textRef.current.scrollWidth;

                if (textWidth > parentWidth) {
                    const overflowPixels = textWidth - parentWidth + 8;
                    setIsOverflowing(true);
                    setScrollDist(overflowPixels);

                    // Calculamos el tiempo: Distancia / Velocidad.
                    // Ponemos un mínimo de 1.5s para que las pausas del inicio/fin no sean muy bruscas en textos muy cortos.
                    const calculatedTime = Math.max(overflowPixels / SPEED_PX_PER_SECOND, 1.5);
                    setAnimationDuration(calculatedTime);
                } else {
                    setIsOverflowing(false);
                    setScrollDist(0);
                    setAnimationDuration(0);
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

    const shouldAnimate = isOverflowing && isHovered;

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden whitespace-nowrap flex items-center ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <style>{`
                @keyframes scroll-bounce {
                    0%, 15% { transform: translateX(0); }
                    85%, 100% { transform: translateX(calc(-1 * var(--scroll-dist))); }
                }
            `}</style>

            {/* Texto original con puntos suspensivos (usado para medir) */}
            <span
                ref={textRef}
                className={`block w-full truncate transition-opacity duration-300 ${
                    shouldAnimate ? "opacity-0" : "opacity-100"
                }`}
            >
                {text}
            </span>

            {/* Texto que hace el rebote (Ping-Pong) a velocidad constante */}
            {isOverflowing && (
                <span
                    className={`absolute top-0 left-0 w-max transition-opacity duration-300 ${
                        shouldAnimate ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    style={{
                        "--scroll-dist": `${scrollDist}px`,
                        // Inyectamos la duración calculada matemáticamente en segundos
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

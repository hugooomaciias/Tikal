/** React & Third-Party Libraries */
import { useEffect, useState } from "react";

/** Icons */
import { 
    IconAlertTriangleFilled, 
    IconCircleCheckFilled, 
    IconInfoCircleFilled,
    IconCircleXFilled
} from "@tabler/icons-react";

/**
 * Toast Notification Component
 *
 * A purely visual component that renders an individual toast notification.
 * It automatically handles its own entry/exit animations and self-dismissal.
 *
 * @component
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the toast.
 * @param {string} props.message - The text message to display.
 * @param {'success'|'error'|'info'} [props.type="info"] - The visual theme of the toast.
 * @param {number} [props.duration=4000] - Lifespan in milliseconds before auto-dismissal.
 * @param {Function} props.onClose - Callback to trigger the unmount sequence in the parent context.
 */
export const ToastNotificationComponent = ({ id, message, type = "info", duration = 4000, onClose }) => {
    // --- 1. Local State ---

   const [isVisible, setIsVisible] = useState(false);

    // --- 2. Derived Styling Configuration ---

    const config = {
        success: {
            icon: IconCircleCheckFilled,
            colors: "bg-primary-50 border-primary-300 text-primary-300",
            iconColor: "text-primary-300"
        },
        error: {
            icon: IconAlertTriangleFilled,
            colors: "bg-tertiary border-tertiary-300 text-tertiary-300",
            iconColor: "text-tertiary-300"
        },
        info: {
            icon: IconInfoCircleFilled,
            colors: "bg-secondary-50 border-secondary-500 text-secondary-500",
            iconColor: "text-secondary-500"
        }
    }[type];

    const Icon = config.icon;

    // --- 3. Side Effects ---

    /**
     * Mount Animation Timer
     * Dispara la animación de entrada justo después de que el componente se renderiza en el DOM.
     */
    useEffect(() => {
        const mountTimer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(mountTimer);
    }, []);

    /**
     * Auto-Dismissal Timer
     * Initiates the exit animation just before the assigned duration ends,
     * then triggers the actual unmount callback.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    // --- 4. Handlers ---

    const handleManualClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
    };

    // --- 5. Render ---

    return (
        <div
            className={`flex items-start justify-between gap-3 px-5 py-4 min-w-[300px] max-w-md border-2 rounded-2xl shadow-xl transition-all duration-300 ease-out pointer-events-auto
                ${config.colors}
                ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"}`}
            role="alert"
        >
            <div className="max-w-[90%] flex items-center gap-3">
                <Icon className={`h-10 w-10 shrink-0 ${config.iconColor}`} />
                <span className="font-medium text-sm sm:text-base">{message}</span>
            </div>
            
            <button onClick={handleManualClose} className="absolute right-2 top-2 shrink-0">
                <IconCircleXFilled className="w-6 h-6" />
            </button>
        </div>
    );
};
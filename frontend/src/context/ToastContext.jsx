/** React & Third-Party Libraries */
import React, { createContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/** Components */
import { ToastNotificationComponent } from "../components/app/ToastNotificationComponent.jsx";

/**
 * Global Toast Context
 *
 * Exposes the reactive state and setter mechanisms for the global toast notification system.
 */
export const ToastContext = createContext(undefined);

/**
 * Toast Provider Component
 *
 * Wraps the application tree to provide global toast notification capabilities.
 * It manages an internal stack of active toasts and utilizes a React Portal to render
 * them at the DOM root, ensuring they are immune to deep component tree z-index or
 * overflow clipping issues.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - The nested component tree.
 */
export const ToastProvider = ({ children }) => {
    // --- 1. Local State ---
    
    const [toasts, setToasts] = useState([]);

    // --- 2. Handlers ---

    /**
     * Add Toast Notification
     * 
     * Appends a new notification payload to the active stack.
     *
     * @param {string} message - The text to display.
     * @param {'success'|'error'|'info'} [type="info"] - The visual theme.
     */
    const addToast = useCallback((message, type = "info") => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    /**
     * Remove Toast Notification
     * 
     * Purges a specific notification from the active stack by its unique ID.
     *
     * @param {string} id - The target toast identifier.
     */
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    // --- 3. Render ---

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            
            {/* Global Portal Layer for Toasts */}
            {typeof document !== "undefined" && createPortal(
                <div className="fixed bottom-8 left-0 right-0 mx-auto flex flex-col items-center gap-3 z-[9999] pointer-events-none">
                    {toasts.map((toast) => (
                        <ToastNotificationComponent
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onClose={removeToast}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
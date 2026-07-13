/** React & Third-Party Libraries */
import React from "react";
import { Navigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { useAuth } from "../../hooks/core/useAuth";

/** Components & Layouts */
import { LoadingPage } from "../../pages/LoadingPage";

/**
 * Protected Route Component
 *
 * This component acts as a router wrapper that prevents unauthenticated users
 * from accessing private pages, such as the dashboard or application main areas.
 * It also handles the transitional loading state during authentication checks.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {JSX.Element} props.children - The child components to render if authenticated.
 * @returns {JSX.Element} Either the requested child route, a loading screen, or a navigation redirection.
 */
export const ProtectedRoute = ({ children }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Authentication Context Hook
     *
     * Extracts the user's authentication and loading status to determine routing permission.
     */
    const { isAuthenticated, isLoading } = useAuth();

    // --- 2. Render ---

    if (isLoading) {
        return <LoadingPage />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

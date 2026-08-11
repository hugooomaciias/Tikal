/** React & Third-Party Libraries */
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";
import { TimeLogProvider } from "./context/TimeLogContext.jsx";

/** Components & Layouts */
import { ProtectedRoute } from "./components/security/ProtectedRoute.jsx";
import { PublicRoute } from "./components/security/PublicRoute.jsx";
import { LandingPage } from "./pages/landing/LandingPage";
import { PaymentPage } from "./pages/landing/PaymentPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoadingPage } from "./pages/LoadingPage";

import { BasePage } from "./pages/app/main/BasePage.jsx";
import { HomePage } from "./pages/app/main/HomePage";
import { TasksPage } from "./pages/app/main/TasksPage";
import { CalendarPage } from "./pages/app/main/CalendarPage";
import { StatisticsPage } from "./pages/app/main/StatisticsPage";
import { TempleModePage } from "./pages/app/main/TempleModePage";

/** Assets, Utils & Constants */
import "./i18n";

/**
 * Application Root Component
 *
 * The `App` component is the root of the React component tree. It sets up the
 * application routing using `react-router-dom` and wraps the entire application
 * with the `AuthProvider` to manage global authentication state.
 *
 * It defines public routes (like the landing and login pages), protected routes
 * (like the home dashboard, requiring an active session), and handles redirection
 * logic for unauthorized access or unknown paths.
 *
 * @component
 * @returns {JSX.Element} The rendered React Router application.
 */
function App() {
    // --- 6. Render ---

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Landing Pages */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/payment" element={<PaymentPage />} />

                    {/* Public Authentication Routes */}
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    {/* Password Recovery Routes */}
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    <Route element={<SyncProvider />}>
                        {/* Loading Screen Route */}
                        <Route path="/loading" element={<LoadingPage />} />

                        {/* Protected App Routes */}
                        <Route element={<TimeLogProvider />}>
                            <Route 
                                element={
                                    <ProtectedRoute>
                                        <BasePage />
                                    </ProtectedRoute>
                                }
                            >
                                <Route path="/home" element={<HomePage />} />
                                <Route path="/tasks" element={<TasksPage />} />
                                <Route path="/calendar" element={<CalendarPage />} />
                                <Route path="/statistics" element={<StatisticsPage />} />
                            </Route>

                            <Route
                                path="/temple-mode"
                                element={
                                    <ProtectedRoute>
                                        <TempleModePage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Route>

                    {/* Fallback Redirection */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

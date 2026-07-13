/** React & Third-Party Libraries */
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/** Contexts, Hooks & Services */
import { AuthProvider } from "./context/AuthContext";
import { SyncProvider } from "./context/SyncContext";
import { TimeLogProvider } from "./context/TimeLogContext";

/** Components & Layouts */
import { ProtectedRoute } from "./components/security/ProtectedRoute.jsx";
import { PublicRoute } from "./components/security/PublicRoute.jsx";
import { LandingPage } from "./pages/landing/LandingPage";
import { PaymentPage } from "./pages/landing/PaymentPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoadingPage } from "./pages/LoadingPage";
import { HomePage } from "./pages/app/HomePage";
import { TasksPage } from "./pages/app/TasksPage";
import { CalendarPage } from "./pages/app/CalendarPage";
import { StatisticsPage } from "./pages/app/StatisticsPage";

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
                                path="/home"
                                element={
                                    <ProtectedRoute>
                                        <HomePage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/tasks"
                                element={
                                    <ProtectedRoute>
                                        <TasksPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/calendar"
                                element={
                                    <ProtectedRoute>
                                        <CalendarPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/statistics"
                                element={
                                    <ProtectedRoute>
                                        <StatisticsPage />
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

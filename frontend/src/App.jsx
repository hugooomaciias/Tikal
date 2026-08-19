/** React & Third-Party Libraries */
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

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

import { MainBasePage } from "./pages/app/main/BasePage";
import { HomePage } from "./pages/app/main/HomePage";
import { TasksPage } from "./pages/app/main/TasksPage";
import { CalendarPage } from "./pages/app/main/CalendarPage";
import { StatisticsPage } from "./pages/app/main/StatisticsPage";
import { TempleModePage } from "./pages/app/main/TempleModePage";

import { SettingsBasePage } from "./pages/app/settings/BasePage";
import { AccountPage } from "./pages/app/settings/AccountPage";
import { PreferencesPage } from "./pages/app/settings/PreferencesPage";
import { ProductivityPage } from "./pages/app/settings/ProductivityPage";
import { NotificationsPage } from "./pages/app/settings/NotificationsPage";
import { SettingsTeamPage } from "./pages/app/settings/TeamPage";

import { TutorialOnboarding } from "./pages/app/main/TutorialOnboarding";

/** Assets, Utils & Constants */
import "./i18n";

/**
 * Synced App Layout Component
 *
 * Un componente "envoltorio" (Layout Route) diseñado para las rutas protegidas que ya han
 * pasado por la capa de sincronización (SyncProvider). 
 * 
 * ¿Por qué es necesario?
 * El componente `TutorialOnboarding` necesita consumir datos del backend usando `useSync()`. 
 * Si lo colocáramos en la raíz de la App (fuera de las rutas), no tendría acceso al `SyncProvider`
 * y la aplicación se rompería. Al colocarlo aquí, nos aseguramos de que el tutorial:
 * 1. Tenga acceso total al contexto de sincronización.
 * 2. Se renderice como una capa flotante global por encima de cualquier página interna.
 * 
 * `<Outlet />` es el marcador de posición donde React Router inyectará la página actual
 * (HomePage, TasksPage, etc.) dependiendo de la URL.
 *
 * @component
 * @returns {JSX.Element} El tutorial superpuesto y el contenido de la ruta anidada.
 */
const SyncedAppLayout = () => {
    return (
        <>
            <TutorialOnboarding />
            <Outlet />
        </>
    );
};

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
                        <Route element={<SyncedAppLayout />}>
                            {/* Loading Screen Route */}
                            <Route path="/loading" element={<LoadingPage />} />

                            {/* Protected App Routes */}
                            <Route element={<TimeLogProvider />}>
                                <Route 
                                    element={
                                        <ProtectedRoute>
                                            <MainBasePage />
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

                                <Route 
                                    element={
                                        <ProtectedRoute>
                                            <SettingsBasePage />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route path="/settings" element={null} />
                                    <Route path="/settings-account" element={<AccountPage />} />
                                    <Route path="/settings-preferences" element={<PreferencesPage />} />
                                    <Route path="/settings-productivity" element={<ProductivityPage />} />
                                    <Route path="/settings-notifications" element={<NotificationsPage />} />
                                    <Route path="/settings-team" element={<SettingsTeamPage />} />
                                </Route>
                            </Route>
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

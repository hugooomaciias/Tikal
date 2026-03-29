/** React & Third-Party Libraries */
import { createContext, useState } from "react";
import { Outlet } from "react-router-dom";

/** Constants */
// IMPORTANTE: Ajusta la ruta de importación según dónde guardes este archivo
import { API_BASE_URL } from "../constants/api.js";

// eslint-disable-next-line react-refresh/only-export-components
export const MainContext = createContext();

/**
 * Workspace Provider Component
 *
 * Manages the global state for projects, phases, tasks, and calendar events.
 * Currently initialized with mock data for UI development, but architected
 * to seamlessly transition to backend API fetching using JWT authorization.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components requiring access to the context.
 * @returns {JSX.Element} The workspace context provider.
 */
export const MainProvider = ({ children }) => {
    /**
     * Loading State
     *
     * Indicates if the application is currently fetching workspace data from the backend.
     */
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

    /**
     * Projects State
     */
    const [projects, setProjects] = useState([
        { id: "p1", type: "project", name: "Proyecto E-commerce", note: "Nota del proyecto" },
        { id: "p2", type: "project", name: "App Móvil UX", note: "" },
    ]);

    /**
     * Phases State
     */
    const [phases, setPhases] = useState([
        { id: "f1", type: "phase", name: "Fase de Diseño", color: "#10b981", note: "" },
        { id: "f2", type: "phase", name: "Fase de Desarrollo", color: "#3b82f6", note: "" },
    ]);

    /**
     * Tasks State
     */
    const [tasks, setTasks] = useState([
        { id: "t1", type: "task", name: "Programar Base de Datos", color: "#8b5cf6", completed: false, subtasks: [] },
        { id: "t2", type: "task", name: "Configurar Servidor", color: "#f43f5e", completed: false, subtasks: [] },
    ]);

    /**
     * Events State
     * (Puedes añadir tus eventos de FullCalendar aquí también si quieres centralizarlos)
     */
    const [events, setEvents] = useState([]);

    /**
     * Derived State: Global Link Options
     *
     * Combines projects, phases, and tasks into a single flat array.
     * This is dynamically consumed by the EventPopUpComponent for dropdown selections.
     */
    const globalLinkOptions = [...projects, ...phases, ...tasks];

    /**
     * Initial Workspace Data Fetch
     *
     * 🚀 INSTRUCCIONES PARA EL FUTURO (BACKEND):
     * Cuando el backend esté listo, vacía los arrays de los useState de arriba: useState([])
     * Y descomenta este bloque useEffect. Utiliza el token de localStorage
     * para autorizar la petición de forma segura, igual que en tu AuthContext.
     */
    /*
    useEffect(() => {
        const fetchWorkspaceData = async () => {
            setIsLoadingWorkspace(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) return; // Si no hay token, no intentamos pedir datos privados

                const response = await fetch(`${API_BASE_URL}/workspace/data`, {
                    method: 'GET',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    }
                });

                const text = await response.text();
                const data = text ? JSON.parse(text) : {};

                if (response.ok) {
                    setProjects(data.projects || []);
                    setPhases(data.phases || []);
                    setTasks(data.tasks || []);
                    setEvents(data.events || []);
                } else {
                    throw new Error(data.message || 'Error fetching workspace data');
                }

            } catch (error) {
                console.error('Workspace data fetch error', error);
                // Aquí podrías disparar notificaciones de error si las tuvieras
            } finally {
                setIsLoadingWorkspace(false);
            }
        };

        fetchWorkspaceData();
    }, []);
    */

    return (
        <MainContext.Provider
            value={{
                isLoadingWorkspace,
                projects,
                setProjects,
                phases,
                setPhases,
                tasks,
                setTasks,
                events,
                setEvents,
                globalLinkOptions, // Pasamos el array combinado listo para usar
            }}
        >
            {children}
            <Outlet />
        </MainContext.Provider>
    );
};

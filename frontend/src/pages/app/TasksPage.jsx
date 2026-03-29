/** React & Third-Party Libraries */
import { useState } from "react";

/** Components */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { HeaderComponent } from "../../components/app/common/HeaderComponent.jsx";
import { ProjectsCardComponent } from "../../components/app/tasks/ProjectsCardComponent.jsx";
import { StagesCardComponent } from "../../components/app/tasks/StagesCardComponent.jsx";
import { TasksCardComponent } from "../../components/app/tasks/TasksCardComponent.jsx";

/** Language */
import { useTranslation } from "react-i18next";

/**
 * Main Application Dashboard Component
 *
 * This component acts as the primary layout wrapper for the authenticated area.
 * It manages the responsive grid layout where widgets are dynamically rendered,
 * moved, and removed.
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard layout.
 */
export const TasksPage = () => {
    const { t } = useTranslation("app_tasks");

    const [isCompleted, setIsCompleted] = useState(false);

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t from-primary-30 to-primary-300 md:bg-gradient-to-r md:from-primary-50 md:to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar */}
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                {/* Header */}
                <HeaderComponent page={t("tasks_title")} get={isCompleted} set={setIsCompleted} t={t} />

                {/* Dashboard Area */}
                <div className="flex-1 flex gap-4">
                    <ProjectsCardComponent t={t} />

                    <StagesCardComponent t={t} />

                    <TasksCardComponent t={t} />
                </div>
            </section>
        </div>
    );
};

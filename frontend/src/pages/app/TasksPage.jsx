/** React & Third-Party Libraries */
import { useState } from "react"

/** Components */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx"
import { ProjectsCardComponent } from "../../components/app/tasks/ProjectsCardComponent.jsx"
import { StagesCardComponent } from "../../components/app/tasks/StagesCardComponent.jsx"
import { TasksCardComponent } from "../../components/app/tasks/TasksCardComponent.jsx"

/** Assets & Icons */
import { IconLayoutKanban, IconLayoutKanbanFilled } from '@tabler/icons-react';

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
	const [isCompleted, setIsCompleted] = useState(false);

	return (
		<div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t from-primary-30 to-primary-300 md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
			{/* Vertical Navbar */}
			<NavbarComponent />

			{/* Main Content Area */}
			<section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
				
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="h-full w-fit bg-primary flex items-center px-5 py-3 rounded-full shadow-md">
						<h2 className="text-2xl text-primary-600 font-bold">Tareas</h2>
					</div>

					<div className="h-full w-fit flex items-center gap-4 rounded-full">
						<button className={`h-fit w-fit ${isCompleted ? 'bg-primary-600' : 'bg-primary'} p-3 rounded-full shadow-md`} onClick={() => setIsCompleted(! isCompleted)}>
							{! isCompleted ? (
								<IconLayoutKanban className="w-10 h-10 text-primary-600" />
							) : (
								<IconLayoutKanbanFilled className="w-10 h-10 text-primary" />
							)}
						</button>

						<button className="h-fit w-fit bg-primary p-3 rounded-full shadow-md">
							<img className="w-10 h-10" src="/public/sabidurIAIcon.svg" alt="Icono Dios de la Sabiduría" />
						</button>
					</div>
				</div>

				{/* Dashboard Area */}
				<div className="flex-1 flex gap-4">
					<ProjectsCardComponent />

					<StagesCardComponent />

					<TasksCardComponent />
				</div>
			</section>
		</div>
	)
}
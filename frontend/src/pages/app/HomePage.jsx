/** React & Third-Party Libraries */
import { useState } from "react"
import { Responsive, WidthProvider } from "react-grid-layout/legacy"

/** Components */
import { NavbarComponent } from "../../components/app/home/NavbarComponent.jsx"
import { HeaderComponent } from "../../components/app/home/HeaderComponent.jsx"
import { TimeTracker } from "../../components/app/widgets/TimeTracker.jsx"
import { Statistics } from "../../components/app/widgets/Statistics.jsx"

/** Assets & Icons */
import { CircleXIcon } from "../../assets/icons/circleXIcon.jsx"

/** Styles */
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

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
export const HomePage = () => {
	/**
	 * Edit Mode State
	 * 
	 * Toggles whether the dashboard grid is currently in an interactive "edit mode"
	 * allowing users to drag, resize, and remove widgets.
	 */
	const [isEditing, setIsEditing] = useState(false);

	/**
	 * Unsaved Changes State
	 * 
	 * Tracks if any modifications have been made to the layout while in edit mode,
	 * prompting actions to save or discard.
	 */
	const [checkChanges, setCheckChanges] = useState(false);

	/**
	 * Widget Layout State
	 * 
	 * Maintains the active list of widgets rendered on the dashboard, including
	 * their identifier, component type, and spatial grid coordinates.
	 */
	const [widgets, setWidgets] = useState([
        { id: "tracker-1", type: "TimeTracker", grid: { x: 0, y: 0, w: 1, h: 1 } },
        { id: "tracker-2", type: "TimeTracker", grid: { x: 1, y: 0, w: 1, h: 1 } },
        { id: "tracker-3", type: "TimeTracker", grid: { x: 2, y: 0, w: 1, h: 1 } },
        { id: "tracker-4", type: "TimeTracker", grid: { x: 3, y: 0, w: 1, h: 1 } },
        { id: "stat-1", type: "Statistics", grid: { x: 0, y: 1, w: 1, h: 1 } },
        { id: "stat-2", type: "Statistics", grid: { x: 1, y: 1, w: 1, h: 1 } },
		{ id: "stat-3", type: "Statistics", grid: { x: 2, y: 1, w: 1, h: 1 } },
		{ id: "stat-4", type: "Statistics", grid: { x: 3, y: 1, w: 1, h: 1 } },
    ]);

	/**
	 * Layout Change Handler
	 *
	 * Fired by `react-grid-layout` whenever a widget is dragged or resized.
	 * Updates the internal `widgets` state with the new spatial coordinates
	 * and flags the dashboard as having unsaved changes.
	 * 
	 * @param {Array<Object>} currentLayout - The latest grid object map provided by the library.
	 */
	const handleLayoutChange = (currentLayout) => {
		if (isEditing) {
			setCheckChanges(true);

			setWidgets((prevWidgets) => {
				return prevWidgets.map((widget) => {
					const updatedLayout = currentLayout.find((item) => item.i === widget.id);
					
					if (updatedLayout) {
						return {
							...widget,
							grid: {
								x: updatedLayout.x,
								y: updatedLayout.y,
								w: updatedLayout.w,
								h: updatedLayout.h
							}
						};
					}
					
					return widget;
				});
				
			});
		}
    };

    /**
     * Remove Widget Handler
     *
     * Deletes a specific widget from the dashboard grid by filtering it
     * out of the current state.
     *
     * @param {string} idToRemove - The unique identifier of the widget to delete.
     */
    const removeWidget = (idToRemove) => {
        setWidgets(widgets.filter(widget => widget.id !== idToRemove));
    }

	return (
		<div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t from-primary-30 to-primary-300 md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
			{/* Vertical Navbar */}
			<NavbarComponent />

			{/* Main Content Area */}
			<section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
				{/* Header */}
				<HeaderComponent isEditing={isEditing} setIsEditing={setIsEditing} checkChanges={checkChanges} setCheckChanges={setCheckChanges}/>

				{/* Dashboard Area */}
				<div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
					<ResponsiveGridLayout className="layout" rowHeight={240} margin={[16, 16]} compactType="vertical"
     					                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
										isDraggable={isEditing} isResizable={isEditing} onLayoutChange={handleLayoutChange}
                    >
						{widgets.map((widget) => (
                            <div key={widget.id} data-grid={widget.grid} className="relative group">
                                
                                {isEditing && (
                                    <button onMouseDown={(e) => e.stopPropagation()} onClick={() => removeWidget(widget.id)} title="Eliminar widget"
                                        className="absolute z-50 -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300"
                                    >
                                        <CircleXIcon className="w-full h-full text-tertiary-200/70 hover:text-tertiary-200" />
                                    </button>
                                )}

                                {/* Render the correct widget component based on the 'type' property */}
                                {widget.type === "TimeTracker" && (
                                    <TimeTracker className={`w-full h-full transition-all duration-300 ${isEditing ? 'opacity-60 border-dashed border-[3px] border-primary-50 cursor-move' : 'opacity-100 shadow-md'}`} />
                                )}
                                
                                {widget.type === "Statistics" && (
                                    <Statistics className={`w-full h-full transition-all duration-300 ${isEditing ? 'opacity-60 border-dashed border-[3px] border-primary-50 cursor-move' : 'opacity-100 shadow-md'}`} />
                                )}

                            </div>
                        ))}
					</ResponsiveGridLayout>
				</div>
			</section>
		</div>
	)
}
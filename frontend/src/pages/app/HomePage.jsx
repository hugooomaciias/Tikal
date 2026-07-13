/** React & Third-Party Libraries */
import { Responsive, WidthProvider } from "react-grid-layout/legacy";

/** Contexts, Hooks & Services */
import { useHomeLogic } from "../../hooks/components/app/home/useHomeLogic.js";

/** Components & Layouts */
import { NavbarComponent } from "../../components/app/common/NavbarComponent.jsx";
import { Header } from "../../components/app/home/Header.jsx";
import { BaseWidget } from "../../components/app/common/widgets/BaseWidget.jsx";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/** Setup & Configurations */
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Main Application Dashboard Component
 *
 * This purely visual component acts as the primary layout wrapper for the authenticated area.
 * It renders the responsive grid layout where widgets are dynamically injected. All data fetching,
 * state management, and grid modification logic (such as dragging and resizing) are entirely delegated
 * to its dedicated headless hook (`useHomeLogic`).
 *
 * @component
 * @returns {JSX.Element|null} The rendered dashboard layout, or null if data is not loaded.
 */
export const HomePage = () => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Dashboard Data & Action Handlers
     *
     * Extracts the resolved layout states, hydrated widget payload, translation mapping,
     * and grid interaction handlers directly from the headless logic hook.
     */
    const { t, homeStates, homeData, homeActions } = useHomeLogic();

    const { isDataLoaded, isEditing, checkChanges, widgets } = homeStates;
    const { homeGeneralInformation } = homeData;
    const { handleLayoutChange, removeWidget, enableEditMode, disableEditMode } = homeActions;

    // --- 2. Render ---

    if (!isDataLoaded || widgets.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-t md:bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
            {/* Vertical Navbar */}
            <NavbarComponent />

            {/* Main Content Area */}
            <section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
                {/* Header Section */}
                <Header
                    data={homeGeneralInformation}
                    isEditing={isEditing}
                    checkChanges={checkChanges}
                    onEnableEdit={enableEditMode}
                    onDisableEdit={disableEditMode}
                />

                {/* Dashboard Responsive Grid Area */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar ${isEditing ? "pb-32" : ""}`}>
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{
                            lg: widgets.map((w) => w.grid),
                            md: widgets.map((w) => w.grid),
                            sm: widgets.map((w) => w.grid),
                            xs: widgets.map((w) => w.grid),
                            xxs: widgets.map((w) => w.grid),
                        }}
                        rowHeight={256}
                        compactType="vertical"
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        isDraggable={isEditing}
                        isResizable={isEditing}
                        onLayoutChange={handleLayoutChange}
                        margin={[10, 10]}
                        containerPadding={[9, 9]}
                    >
                        {widgets.map((widget) => {
                            const allowsDrag = widget.grid.isDraggable !== false;
                            const allowsResize = widget.grid.isResizable !== false;

                            const isModifiable = isEditing && (allowsDrag || allowsResize);

                            return (
                                <div key={widget.id} className="relative group h-full">
                                    {/* Edit Mode Controls Overlay */}
                                    {isModifiable && (
                                        <button
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={() => removeWidget(widget.id)}
                                            title="Eliminar widget"
                                            className="absolute z-50 -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300"
                                        >
                                            <IconCircleXFilled className="w-full h-full text-tertiary-200/70 hover:text-tertiary-200" />
                                        </button>
                                    )}

                                    {/* Drag Handle Overlay */}
                                    {isEditing && allowsDrag && (
                                        <div className="absolute inset-0 z-40 cursor-move rounded-3xl" />
                                    )}

                                    {/* Dynamic Widget Injection Component */}
                                    <BaseWidget
                                        t={t}
                                        title={widget.config.title}
                                        subtitle={widget.config.subtitle}
                                        bgColor={widget.config.bgColor}
                                        textColor={widget.config.textColor}
                                        actions={widget.config.actions}
                                        pageLink={widget.config.pageLink}
                                        className={`transition-all duration-300 ${isModifiable ? `opacity-60 border-dashed border-[3px] ${widget.config.borderColor ? widget.config.borderColor : "border-primary-50"} cursor-move` : "opacity-100"}`}
                                    >
                                        {widget.config.content && (
                                            <widget.config.content.component props={widget.config.content.props} />
                                        )}
                                    </BaseWidget>
                                </div>
                            );
                        })}
                    </ResponsiveGridLayout>
                </div>
            </section>
        </div>
    );
};

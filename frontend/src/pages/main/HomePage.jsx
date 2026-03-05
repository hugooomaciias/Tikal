import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext.jsx"
import { HomeIcon } from "../../assets/icons/homeIcon.jsx"
import { ListCheckIcon } from "../../assets/icons/listCheckIcon.jsx"
import { CalendarIcon } from "../../assets/icons/calendarIcon.jsx"
import { ChartBarIcon } from "../../assets/icons/chartBarIcon.jsx"
import { TempleIcon } from "../../assets/icons/templeIcon.jsx"
import { GroupIcon } from "../../assets/icons/groupIcon.jsx"
import { CircleCheckIcon } from "../../assets/icons/circleCheckIcon.jsx"
import { TrendingUpIcon } from "../../assets/icons/trendingUpIcon.jsx"
import { ClipboardIcon } from "../../assets/icons/clipboardIcon.jsx"
import { EditIcon } from "../../assets/icons/editIcon.jsx"
import { SquaredRoundedXIcon } from "../../assets/icons/squaredRoundedXIcon.jsx"
import { SquaredRoundedPlusIcon } from "../../assets/icons/squaredRoundedPlusIcon.jsx"
import { CircleXIcon } from "../../assets/icons/circleXIcon.jsx"
import { TimeTracker } from "../../components/widgets/TimeTracker.jsx"
import { Statistics } from "../../components/widgets/Statistics.jsx"
import Responsive from "react-grid-layout/build/ResponsiveReactGridLayout";
import WidthProvider from "react-grid-layout/build/components/WidthProvider";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Home = () => {
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
			navigate('/login');
		} catch (error) {
			console.error('Error al cerrar sesión', error);
		}
	};

	const [isExpanded, setIsExpanded] = useState(false);

	const [activeTab, setActiveTab] = useState("Inicio");

	const [isEditing, setIsEditing] = useState(false);

	const [layouts, setLayouts] = useState({});

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

	const handleLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
    };

    const removeWidget = (idToRemove) => {
        setWidgets(widgets.filter(widget => widget.id !== idToRemove));
    }

	/**
	 * Icon Component Map
	 *
	 * Maps string identifiers to their corresponding React icon components.
	 * Used dynamically when rendering the sign-in options below.
	 */
	const iconMap = {
		"HomeIcon": HomeIcon,
		"ListCheckIcon": ListCheckIcon,
		"CalendarIcon": CalendarIcon,
		"ChartBarIcon": ChartBarIcon,
		"TempleIcon": TempleIcon,
		"GroupIcon": GroupIcon,
		"CircleCheckIcon": CircleCheckIcon,
		"TrendingUpIcon": TrendingUpIcon,
		"ClipboardIcon": ClipboardIcon
	};

	/**
	 * Social Sign-in Options
	 *
	 * Configuration array for rendering social login buttons.
	 */
	const navbarOptions = [
		{ icon: "HomeIcon", title: "Inicio" },
		{ icon: "ListCheckIcon", title: "Tareas" },
		{ icon: "CalendarIcon", title: "Calendario" },
		{ icon: "ChartBarIcon", title: "Estadísticas" },
		{ icon: "TempleIcon", title: "Modo Templo" },
		{ icon: "GroupIcon", title: "Grupos" },
	];

	/**
	 * Social Sign-in Options
	 *
	 * Configuration array for rendering social login buttons.
	 */
	const infoOptions = [
		{ icon: "CircleCheckIcon", value: "28", title: "Proyectos terminados" },
		{ icon: "TrendingUpIcon", value: "5", title: "Proyectos en proceso" },
		{ icon: "ClipboardIcon", value: "10", title: "Proyectos pendientes" }
	];

	return (
		<div className="flex flex-col md:flex-row h-[100dvh] bg-gradient-to-r from-primary-50 to-primary-300 p-2 md:p-4 gap-4 md:gap-8 overflow-hidden">
			{/* Vertical Navbar (Left Side) - Completely rounded */}
			<aside className={`flex bg-primary-300 text-primary shadow-2xl transition-all duration-[300ms] shrink-0 z-50
                                /* ESCRITORIO (Diseño base original intocable) */
                                flex-col p-5 justify-between rounded-[3rem] h-full
                                ${isExpanded ? 'w-72' : 'w-[104px]'}
                                /* MÓVIL (Anula lo anterior solo en pantallas < 768px) */
                                max-md:order-last max-md:flex-row max-md:w-full max-md:h-[72px] max-md:p-2 max-md:rounded-[2rem] max-md:items-center max-md:justify-around`}
            >
				{/* Logo Placeholder */}
				<div className={`h-10 w-auto flex items-center  gap-12 cursor-pointer ${isExpanded ? 'justify-between' : 'justify-center'}`}
						onClick={() => setIsExpanded(! isExpanded)}
				>
					<img className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" src="/public/logoHeader_2.svg" alt="Logo Tikal" />
					{/* Renderizado condicional del texto del logo */}
                    {isExpanded && (
                        <span className="text-primary-50 text-3xl font-bold tracking-[0.3em]">
                            TIKAL
                        </span>
                    )}
				</div>
					
				{/* Navigation Links */}
				<nav className={`flex flex-col gap-8 w-full ${isExpanded ? 'items-start' : 'items-center'}`}>
					{navbarOptions.map((option, index) => {
						const IconComponent = iconMap[option.icon];

						const isActive = activeTab === option.title;

						return (
							<Link key={index} to="#" onClick={() => setActiveTab(option.title)}
									className={`flex items-center gap-6 transition-all duration-200 ${isActive ? 'text-primary-50' : 'text-primary-500 hover:text-primary-200'}`}
							>
								<IconComponent className="h-8 w-8" />

								{isExpanded && (
                                    <span className="text-2xl font-light tracking-[0.05em] whitespace-nowrap">
                                        {option.title}
                                    </span>
                                )}
							</Link>
						);
					})}
				</nav>
				
				{/* Bottom Action (e.g., Logout) */}
                <div className={`h-fit w-full bg-primary-50 rounded-full mx-auto transition-colors duration-200 flex items-center mt-8 p-2
								${isExpanded ? 'w-full justify-start p-3' : 'w-fit justify-center p-2'}`}
				>
                    
                    {/* Contenedor del Avatar */}
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border-[3px] border-primary-300 cursor-pointer">
                        <img className="w-full h-full object-cover shadow-md" src="/public/Avatar_0.svg" alt="Avatar Usuario" />
                    </div>

                    {/* Información del usuario (Visible solo en escritorio) */}
					{isExpanded && (
                        <div className="flex flex-col ml-4 overflow-hidden">
                            <span className="text-primary-600 text-lg font-medium whitespace-nowrap">
                                Hugo
                            </span>
                            <span onClick={handleLogout} className="text-primary-600 cursor-pointer whitespace-nowrap hover:underline">
                                Cerrar sesión
                            </span>
                        </div>
                    )}
                </div>
			</aside>

			{/* Main Content Area */}
			<section className="flex-1 flex flex-col gap-6 w-full h-full overflow-hidden">
				{/* Top Navbar - Wider than the vertical navbar */}
				<header className="h-fit w-full bg-primary shadow-md rounded-[2.5rem] flex items-start justify-between py-6 px-8">
					<div className="h-fit w-fit flex items-center justify-center gap-10">
						<div className="relative h-36 w-36 flex items-center justify-center p-2 rounded-full overflow-hidden border-[3px] border-primary-600">
							<div className="h-full w-full bg-primary-600/40 rounded-full overflow-hidden cursor-pointer">
								<img className="w-full h-full object-cover shadow-md" src="/public/Avatar_0.svg" alt="Avatar Usuario" />
							</div>
						</div>

						<div className="flex items-center gap-12">
							{infoOptions.map((option, index) => {
								const IconComponent = iconMap[option.icon];

								return (
									<div key={index} className="w-32 flex flex-col items-center gap-2 text-quaternary-700">
										<div className="w-full flex items-center justify-between">
											<div className="bg-primary-300 p-1 rounded-xl">
												<IconComponent className="h-8 w-8 text-primary" />
											</div>
											<span className="text-3xl font-bold">
												{option.value}
											</span>
										</div>

										<span className="text-center text-2xl font-light">
											{option.title}
										</span>
									</div>
								);
							})}
						</div>
					</div>

					<div className="flex gap-4 items-center">
						<div className="w-fit h-fit flex flex-col items-center justify-between gap-2 cursor-pointer">
							<img className="w-14 h-14" src="/public/sabidurIAIcon.svg" alt="Icono Dios de la Sabiduría" />

							<div className="w-9 h-9 text-primary-600/70 flex items-center justify-center transition-all duration-200">
								{!isEditing ? (
									<div className="w-full h-full hover:text-primary-600" onClick={() => setIsEditing(! isEditing)}>
										<EditIcon className="w-full h-full" />
									</div>
                                ) : (
									<div className="w-full h-full flex flex-col items-center justify-between">
										<div className="w-full h-full hover:text-primary-600" onClick={() => setIsEditing(! isEditing)}>
											<SquaredRoundedXIcon className="w-full h-full" />
										</div>
										
										<div className="w-full h-full hover:text-primary-600">
											<SquaredRoundedPlusIcon className="w-full h-full" />
										</div>
									</div>
                                )}
							</div>
						</div>
					</div>
				</header>

				{/* Mini Dashboard Area */}
				{/* White Cards Grid */}
				<div className="flex-1 overflow-y-auto pb-4 custom-scrollbar">
					<ResponsiveGridLayout className="layout" rowHeight={240} margin={[16, 16]} compactType="vertical"
     					                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
										isDraggable={isEditing} isResizable={isEditing} onLayoutChange={handleLayoutChange}
                    >
						{widgets.map((widget) => (
                            <div key={widget.id} data-grid={widget.grid} className="relative group">
                                
                                {isEditing && (
                                    <button
                                        // IMPORTANTE: stopPropagation evita que al hacer clic se active el arrastre por error
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={() => removeWidget(widget.id)}
                                        className="absolute z-50 -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300"
                                        title="Eliminar widget"
                                    >
                                        <CircleXIcon className="w-full h-full text-tertiary-200/70 hover:text-tertiary-200" />
                                    </button>
                                )}

                                {/* Renderizamos el componente que toque según el 'type' */}
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

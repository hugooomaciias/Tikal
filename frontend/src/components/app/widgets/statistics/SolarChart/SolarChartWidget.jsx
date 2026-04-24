import { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { PROJECTS_ICONS } from "../../../../../constants/projects_icons.js";
import { FilterComponent } from "./FilterComponent.jsx";
import {
    IconCalendar,
    IconFilter,
    IconBook,
    IconCircleXFilled,
    IconChevronLeft,
    IconChevronRight,
    IconCheck,
} from "@tabler/icons-react";
import tailwindConfig from "../../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

// 2. Paleta de colores extraída exactamente de tu diseño (de oscuro a claro)
const SOLAR_PALETTE = [
    colors.primary[800], // Verde muy oscuro
    colors.primary[600], // Verde medio
    colors.primary[400], // Verde claro
    colors.primary[200], // Verde muy claro
    colors.primary[50], // Por si hay más de 4 elementos
];

const getIconComponent = (iconId) => {
    const foundIcon = PROJECTS_ICONS.find((icon) => icon.id === iconId);
    return foundIcon ? foundIcon.component : IconBook;
};

export const SolarChartWidget = ({ props }) => {
    const [activeDrawer, setActiveDrawer] = useState(null);
    const [hiddenProjects, setHiddenProjects] = useState([]);
    const [tempHiddenProjects, setTempHiddenProjects] = useState([]);

    const [timeMode, setTimeMode] = useState("GLOBAL");
    const [timeOffset, setTimeOffset] = useState(0);

    // 3. Extraemos datos del backend con fallbacks
    const slices = props?.slices || [];
    const sortedSlices = [...slices].sort((a, b) => b.minutesDedicated - a.minutesDedicated);
    const mostRecurringName = props?.mostRecurringListName || "Desconocido";

    // 4. Formateamos los datos para Nivo Pie
    const chartData = sortedSlices.map((slice, index) => ({
        id: slice.sliceId.toString(),
        label: slice.sliceName,
        minutes: slice.minutesDedicated,
        iconString: slice.logoOrColor,
        // Asignamos el color basado en su posición para asegurar el degradado
        color: SOLAR_PALETTE[index % SOLAR_PALETTE.length],
    }));

    const visibleSlicesBase = chartData.filter((d) => !hiddenProjects.includes(d.id));
    const totalVisibleMinutes = visibleSlicesBase.reduce((sum, slice) => sum + slice.minutes, 0);

    const visibleChartData = visibleSlicesBase.map((slice) => ({
        ...slice,
        value: totalVisibleMinutes > 0 ? Math.round((slice.minutes / totalVisibleMinutes) * 100) : 0,
    }));

    // Encontramos el icono de la lista más recurrente buscándolo en los slices
    const recurringData = chartData.find((d) => d.label === mostRecurringName);
    const recurringBgColor = recurringData ? recurringData.color : colors.primary[100];
    const RecurringIcon = getIconComponent(recurringData?.iconString);

    // --- MANEJADORES DE ESTADO ---
    const openDrawer = (drawerType) => {
        if (drawerType === "PROJECTS") {
            setTempHiddenProjects([...hiddenProjects]); // Resetea la vista temporal a como esté el gráfico ahora
        }
        setActiveDrawer(drawerType);
    };

    const getMonthName = (date) => {
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        return months[date.getMonth()];
    };

    // Helper visual para mostrar en la barra acoplada con fechas calculadas reales
    const getTimeLabel = () => {
        // Usamos la fecha de HOY como punto de partida
        const today = new Date();

        if (timeMode === "DAILY") {
            // Calculamos el día exacto sumando/restando el offset
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + timeOffset);

            // Formato: "22 ABR"
            return `${targetDate.getDate()} ${getMonthName(targetDate)}`;
        }

        if (timeMode === "WEEKLY") {
            // Calculamos la semana actual
            const targetDate = new Date(today);
            // Sumamos/restamos semanas (7 días por offset)
            targetDate.setDate(today.getDate() + timeOffset * 7);

            // Encontrar el Lunes de esa semana (suponiendo que la semana empieza en Lunes)
            const dayOfWeek = targetDate.getDay() || 7; // Convertir Domingo (0) a 7
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - dayOfWeek + 1);

            // Encontrar el Domingo de esa semana
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            // Si ambos días caen en el mismo mes: "20-26 ABR"
            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${getMonthName(startOfWeek)}`;
            }
            // Si la semana pisa dos meses diferentes: "28 ABR - 4 MAY"
            else {
                return `${startOfWeek.getDate()} ${getMonthName(startOfWeek)} - ${endOfWeek.getDate()} ${getMonthName(endOfWeek)}`;
            }
        }

        if (timeMode === "MONTHLY") {
            // Calculamos el mes exacto
            const targetDate = new Date(today);
            targetDate.setMonth(today.getMonth() + timeOffset);

            // Formato: "ABR"
            return getMonthName(targetDate);
        }

        return "";
    };

    const CustomArcLabelsLayer = ({ dataWithArc, arcGenerator, centerX, centerY }) => {
        return (
            <g transform={`translate(${centerX}, ${centerY})`}>
                {dataWithArc.map((datum) => {
                    // arc.centroid calcula el centro exacto (x, y) geométrico de cada trozo de pizza
                    const [x, y] = arcGenerator.centroid(datum.arc);
                    const SliceIcon = getIconComponent(datum.data.iconString);

                    // Definimos una caja de 60x60 px.
                    // Para que quede perfectamente centrada en el punto, restamos la mitad (30) a X e Y.
                    return (
                        <foreignObject
                            key={datum.data.id}
                            x={x - 30}
                            y={y - 30}
                            width={60}
                            height={60}
                            style={{ overflow: "visible", pointerEvents: "none" }}
                        >
                            {/* ¡Aquí ya podemos usar Tailwind y HTML normal! */}
                            <div className="w-full h-full flex flex-col items-center justify-center text-primary">
                                <SliceIcon size={22} stroke={1.5} />
                                <span className="text-sm font-bold leading-none mt-0.5">{datum.data.value}%</span>
                            </div>
                        </foreignObject>
                    );
                })}
            </g>
        );
    };

    if (!slices.length) {
        return null;
    }

    return (
        <div className="h-full w-full flex flex-col items-center justify-between px-4 relative">
            <div className="w-full flex flex-col items-center gap-6">
                {/* GRÁFICO NIVO (Ocupa el espacio principal) */}
                <div className="flex-1 min-h-[230px] w-full mt-2">
                    <ResponsivePie
                        data={visibleChartData}
                        colors={{ datum: "data.color" }}
                        innerRadius={0.4}
                        padAngle={2}
                        cornerRadius={8}
                        margin={{ right: -10, left: -10 }}
                        activeOuterRadiusOffset={0}
                        fit={true}
                        enableArcLinkLabels={false}
                        enableArcLabels={false}
                        isInteractive={true}
                        sortByValue={true}
                        animate={true}
                        layers={["arcs", CustomArcLabelsLayer, "arcLinkLabels", "legends"]}
                        tooltip={({ datum }) => (
                            <div className="flex items-center gap-2 bg-primary-50 py-2 px-3 shadow-lg rounded-xl">
                                <div className="h-full flex flex-col items-start justify-between">
                                    <span className="text-xs text-quaternary-700 text-nowrap">{datum.data.label}</span>
                                    <span className="text-base font-bold text-quaternary-700">
                                        {datum.data.minutes} min
                                    </span>
                                </div>
                            </div>
                        )}
                    />
                </div>

                {/* SECCIÓN INFERIOR: Lista más recurrente */}
                <div className="flex items-center gap-4 text-quaternary-700">
                    {/* Left-Aligned Icon Compartment */}
                    <div
                        className="p-2.5 rounded-2xl shadow-sm flex-shrink-0"
                        style={{ backgroundColor: recurringBgColor }}
                    >
                        <RecurringIcon className={`h-4 w-4 md:h-7 md:w-7 text-primary`} />
                    </div>

                    {/* Right-Aligned Text Information */}
                    <div className="flex flex-col">
                        {/* Top Title */}
                        <span className="text-sm md:text-base font-medium text-quaternary-500 leading-none">
                            Lista más recurrente
                        </span>

                        {/* Bottom Value */}
                        <span className="text-lg md:text-xl font-bold -mt-1 leading-none">{mostRecurringName}</span>
                    </div>
                </div>
            </div>

            {/* --- NUEVOS BOTONES ANCLADOS A LA BASE --- */}
            {/* Posición absoluta abajo, ocupando todo el ancho. Estilo "isla" conectada al borde inferior */}
            <div className="flex justify-center shrink-0 w-full z-10 pointer-events-none mt-4 relative">
                <div className="flex items-end min-w-[260px] pointer-events-auto">
                    {/* MITAD IZQUIERDA (Filtro Tiempo + Nav Acoplada) */}
                    <div className="w-1/2 flex flex-col relative">
                        {/* Bloque de navegación (Solo visible si es Diario/Semanal/Mensual) */}
                        {["DAILY", "WEEKLY", "MONTHLY"].includes(timeMode) && (
                            <div className="bg-primary-200 text-primary rounded-t-[20px] px-2 py-1.5 flex items-center justify-between text-xs font-bold shadow-inner z-0">
                                <button
                                    onClick={() => setTimeOffset((prev) => prev - 1)}
                                    className="text-primary/70 hover:text-primary p-0.5 rounded-full transition-colors"
                                >
                                    <IconChevronLeft size={14} stroke={3} />
                                </button>
                                <span>{getTimeLabel()}</span>
                                <button
                                    onClick={() => setTimeOffset((prev) => prev + 1)}
                                    className="hover:bg-primary-300 p-0.5 rounded-full transition-colors"
                                    disabled={timeOffset >= 0}
                                >
                                    <IconChevronRight
                                        size={14}
                                        stroke={3}
                                        className={timeOffset >= 0 ? "opacity-30" : ""}
                                    />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openDrawer("TIME");
                            }}
                            className={`relative z-10 flex items-center justify-center w-full gap-1.5 bg-primary-300 text-primary p-2.5 ${timeMode === "DAILY" || timeMode === "WEEKLY" || timeMode === "MONTHLY" ? "" : "rounded-tl-[32px]"} text-xs font-bold transition-colors hover:bg-primary-400/90`}
                        >
                            <IconCalendar size={20} stroke={2} />
                            <span className="capitalize">
                                {timeMode === "GLOBAL"
                                    ? "Global"
                                    : timeMode === "CUSTOM"
                                      ? "Custom"
                                      : timeMode === "DAILY"
                                        ? "Diario"
                                        : timeMode === "WEEKLY"
                                          ? "Semanal"
                                          : "Mensual"}
                            </span>
                        </button>
                    </div>

                    {/* MITAD DERECHA (Filtro Proyectos) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openDrawer("PROJECTS");
                        }}
                        className="w-1/2 relative z-10 flex items-center justify-center gap-1.5 bg-primary-300 text-primary p-2.5 rounded-tr-[32px] text-xs font-bold transition-colors hover:bg-primary-400/90"
                    >
                        <IconFilter size={20} stroke={2} />
                        <span>Proyectos</span>
                    </button>
                </div>
            </div>

            <FilterComponent
                activeDrawer={activeDrawer}
                setActiveDrawer={setActiveDrawer}
                timeMode={timeMode}
                setTimeMode={setTimeMode}
                setTimeOffset={setTimeOffset}
                chartData={chartData}
                getIconComponent={getIconComponent}
                tempHiddenProjects={tempHiddenProjects}
                setTempHiddenProjects={setTempHiddenProjects}
                setHiddenProjects={setHiddenProjects}
            />
        </div>
    );
};

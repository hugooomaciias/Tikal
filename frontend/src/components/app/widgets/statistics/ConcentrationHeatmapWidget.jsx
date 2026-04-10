const INTENSITY_COLORS = {
    NONE: "bg-primary-50 text-primary-200/50", // Casi invisible
    LOW: "bg-primary-100 text-primary-600", // Verde muy suave
    MEDIUM: "bg-primary-200 text-primary-700", // Verde medio
    HIGH: "bg-primary-400 text-primary-50", // Verde fuerte
    MAXIMUM: "bg-primary-700 text-primary-50", // Verde GitHub oscuro
};

export const ConcentrationHeatmapWidget = () => {
    const generateHeatmapData = (month, year) => {
        // Obtenemos el primer día del mes (0 = Domingo, 1 = Lunes...)
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        // Ajustamos para que Lunes sea 0 (Si el getDay es 0 -domingo-, lo pasamos a 6)
        const emptySlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const daysInMonth = new Date(year, month, 0).getDate();
        const days = [];

        // 1. Añadimos slots vacíos (Días del mes anterior para alinear el grid)
        for (let i = 0; i < emptySlots; i++) {
            days.push({ dayOfMonth: null, intensity: "NONE", minutesDedicated: 0 });
        }

        // 2. Generamos los días del mes con intensidades variadas para ver el diseño
        for (let i = 1; i <= daysInMonth; i++) {
            let intensity = "LOW";
            let minutes = Math.floor(Math.random() * 60) + 10;

            // Simulamos el patrón de tu imagen (aproximado)
            if ([1, 2, 3, 4, 5].includes(i)) intensity = "MEDIUM";
            if ([6, 7, 8, 9, 10].includes(i)) intensity = "MAXIMUM";
            if ([11, 12, 13, 14, 15].includes(i)) intensity = "LOW";
            if ([16, 17, 18, 19, 20].includes(i)) {
                intensity = "NONE"; // Días sin apenas actividad
                minutes = 0;
            }

            days.push({
                date: `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
                dayOfMonth: i,
                minutesDedicated: minutes,
                intensity: intensity,
            });
        }

        return { year, month, days };
    };

    const heatmapMock = generateHeatmapData(9, 2025);

    if (!heatmapMock?.days) return null;

    return (
        <div className="h-full w-full flex items-center justify-center p-1">
            <div className="grid grid-cols-7 gap-1 w-full">
                {heatmapMock.days.map((day, index) => (
                    <div
                        key={index}
                        title={day.dayOfMonth ? `${day.minutesDedicated} min` : ""}
                        className={`
                            h-5 md:h-[26px] flex items-center justify-center 
                            rounded-md text-[11px] font-bold transition-all duration-300
                            ${INTENSITY_COLORS[day.intensity]}
                        `}
                    >
                        <span className="leading-none">{day.dayOfMonth}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

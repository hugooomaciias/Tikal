const INTENSITY_COLORS = {
    NONE: "bg-primary-50 text-primary-200", // x = 0
    VERY_LOW: "bg-primary-100/50 text-primary-500", // 0 < x <=2
    LOW: "bg-primary-100 text-primary-600", // 2 < x <=4
    MEDIUM: "bg-primary-200 text-primary-700", // 4 < x <= 6
    HIGH: "bg-primary-400 text-primary-50", // 6 < x <= 8
    VERY_HIGH: "bg-primary-500 text-primary-50", // 8 < x <= 10
    MAXIMUM: "bg-primary-700 text-primary-50", // 10 < x
};

export const ConcentrationHeatmapWidget = ({ props }) => {
    const year = props?.year || new Date().getFullYear();
    const month = props?.month || new Date().getMonth() + 1;
    const days = props?.days || [];

    const generateHeatmapData = () => {
        if (!days.length) return [];

        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const emptySlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        const data = [];

        for (let i = 0; i < emptySlots; i++) {
            data.push({ dayOfMonth: null, intensity: "NONE", minutesDedicated: 0 });
        }
        days.forEach((day) => {
            data.push({
                date: day.date,
                dayOfMonth: day.dayOfMonth,
                minutesDedicated: day.minutesDedicated,
                intensity: INTENSITY_COLORS[day.intensity] ? day.intensity : "NONE",
            });
        });

        return data;
    };

    const heatmap = generateHeatmapData();

    if (!heatmap.length) {
        return null;
    }

    return (
        <div className="h-full w-full flex items-center justify-center p-1">
            <div className="grid grid-cols-7 gap-1 w-full">
                {heatmap.map((day, index) => {
                    if (!day.dayOfMonth) {
                        return <div key={index} className="h-5 md:h-[26px]"></div>;
                    }
                    return (
                        <div
                            key={index}
                            title={day.dayOfMonth ? `${day.minutesDedicated} min` : ""}
                            className={`
                                relative group/celda h-5 md:h-[26px] flex items-center justify-center 
                                rounded-md text-[11px] font-bold transition-all duration-300
                                ${INTENSITY_COLORS[day.intensity]}
                            `}
                        >
                            <span className="leading-none">{day.dayOfMonth}</span>

                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 invisible group-hover/celda:opacity-100 group-hover/celda:visible transition-all duration-200 z-50 pointer-events-none">
                                {/* Caja del contenido del tooltip (DISEÑA AQUÍ A TU GUSTO) */}
                                <div className="bg-primary-300 text-primary-50 text-[10px] px-2 py-1 rounded-md shadow-lg whitespace-nowrap flex items-center gap-1">
                                    <span className="font-extrabold">{day.minutesDedicated}</span>
                                    <span>min</span>
                                </div>

                                {/* Triangulito (Flecha) apuntando a la celda */}
                                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-transparent border-t-primary-300 mx-auto"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

import { useRef, useEffect, useState } from "react";

import { DatePickerComponent } from "../../../common/popups/DatepickerComponent.jsx";

import { IconCircleXFilled, IconCheck } from "@tabler/icons-react";

export const FilterComponent = ({
    activeDrawer,
    setActiveDrawer,
    timeMode,
    setTimeMode,
    setTimeOffset,
    chartData,
    getIconComponent,
    tempHiddenProjects,
    setTempHiddenProjects,
    setHiddenProjects,
}) => {
    const drawerRef = useRef(null);

    const [customDates, setCustomDates] = useState({ start: "", end: "" });

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Si el cajón está abierto y el clic ocurrió FUERA del elemento referenciado, lo cerramos
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setActiveDrawer(null);
            }
        };

        if (activeDrawer) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeDrawer]);

    const handleTimeModeChange = (mode) => {
        setTimeMode(mode);
        setTimeOffset(0); // Reseteamos la navegación al día/semana actual
        if (mode !== "CUSTOM") setActiveDrawer(null); // Cerramos si no es custom
    };

    // Al hacer clic en un proyecto en el cajón, SOLO afectamos al estado temporal
    const toggleTempProjectVisibility = (id) => {
        setTempHiddenProjects((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    // Al pulsar "Aplicar Cambios"
    const applyProjectFilters = () => {
        setHiddenProjects([...tempHiddenProjects]); // Pasamos los temporales al gráfico real
        setActiveDrawer(null); // Cerramos el cajón
    };

    return (
        <div
            className={`absolute inset-0 overflow-hidden z-20 rounded-[inherit] ${
                activeDrawer ? "pointer-events-auto " : "pointer-events-none "
            }${activeDrawer === "TIME" && timeMode === "CUSTOM" ? "overflow-visible" : "overflow-hidden"}`}
        >
            <div
                ref={drawerRef}
                className={`absolute w-full inset-0 bg-primary-300 z-20 flex flex-col rounded-3xl transition-transform duration-300 ease-in-out ${
                    activeDrawer ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* Cabecera del Drawer */}
                <div className="flex items-center justify-between p-4">
                    <h3 className="font-bold text-quaternary-50 text-lg">
                        {activeDrawer === "TIME" ? "Filtro de tiempo" : "Filtrar proyectos"}
                    </h3>
                    <button
                        className="text-primary/70 hover:text-primary transition-colors"
                        onClick={() => setActiveDrawer(null)}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Contenido Dinámico del Drawer */}
                <div
                    className={`flex-1 p-4 ${
                        activeDrawer === "PROJECTS" ? "overflow-y-auto custom-scrollbar" : "overflow-visible"
                    }`}
                >
                    {activeDrawer === "TIME" && (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                                {/* Dummy content */}
                                {[
                                    { id: "DAILY", label: "Diario" },
                                    { id: "WEEKLY", label: "Semanal" },
                                    { id: "MONTHLY", label: "Mensual" },
                                    { id: "GLOBAL", label: "Global" },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleTimeModeChange(t.id)}
                                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-colors ${timeMode === t.id ? "bg-primary-600 border-primary-100 text-primary" : "bg-primary border-primary hover:bg-primary-50 hover:border-primary-50 text-quaternary-700"}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <button
                                    onClick={() => handleTimeModeChange("CUSTOM")}
                                    className={`w-full p-3 text-sm font-bold transition-colors ${
                                        timeMode === "CUSTOM"
                                            ? "bg-primary-600 border-x-2 border-t-2 border-primary-100 text-primary rounded-t-xl"
                                            : "bg-primary border-2 border-primary hover:bg-primary-50 hover:border-primary-50 text-quaternary-700 rounded-xl"
                                    }`}
                                >
                                    Rango Customizado
                                </button>

                                {timeMode === "CUSTOM" && (
                                    <div className="flex flex-col gap-2 p-4 bg-primary-600 border-x-2 border-b-2 border-t-none border-primary-100 rounded-b-xl animate-fade-in">
                                        <div className="flex gap-2">
                                            <DatePickerComponent
                                                value={customDates.start}
                                                onChange={(date) =>
                                                    setCustomDates((prev) => ({ ...prev, start: date }))
                                                }
                                                label="Desde"
                                                className="input input-primary peer z-100"
                                            />
                                            <DatePickerComponent
                                                value={customDates.end}
                                                onChange={(date) => setCustomDates((prev) => ({ ...prev, end: date }))}
                                                label="Hasta"
                                                className="input input-primary peer"
                                            />
                                        </div>
                                        <div className="mt-auto pt-2 shrink-0">
                                            <button
                                                onClick={applyProjectFilters}
                                                className="w-full py-3 bg-primary text-primary-600 rounded-xl font-bold hover:bg-primary-100 transition-colors shadow-sm"
                                            >
                                                Aplicar rango
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeDrawer === "PROJECTS" && (
                        <div className="flex flex-col h-full">
                            {/* Cuadrícula de proyectos */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {chartData.map((s) => {
                                    const PIcon = getIconComponent(s.iconString);
                                    // AHORA COMPROBAMOS EL ESTADO TEMPORAL
                                    const isHidden = tempHiddenProjects.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            // AL HACER CLIC CAMBIAMOS EL TEMPORAL
                                            onClick={() => toggleTempProjectVisibility(s.id)}
                                            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 shadow-sm border-2 ${isHidden ? "border-transparent opacity-60 grayscale bg-gray-100" : "border-primary-100"}`}
                                            style={{ backgroundColor: isHidden ? undefined : s.color }}
                                        >
                                            {!isHidden && (
                                                <div className="absolute top-2 right-2 text-white bg-black/20 rounded-full p-0.5">
                                                    <IconCheck size={14} stroke={3} />
                                                </div>
                                            )}
                                            <PIcon
                                                size={32}
                                                stroke={1.5}
                                                className={isHidden ? "text-gray-400" : "text-white"}
                                            />
                                            <span
                                                className={`mt-2 text-xs font-bold text-center leading-tight ${isHidden ? "text-gray-500" : "text-white"}`}
                                            >
                                                {s.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Botón Aplicar anclado al fondo de su sección */}
                            <div className="mt-auto pt-2 shrink-0">
                                <button
                                    onClick={applyProjectFilters}
                                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm"
                                >
                                    Aplicar cambios
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import { useEffect } from "react";

import { IconChevronDown, IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";

import { TabsComponent } from "../common/TabsComponent";

/** Hooks */
import { useTranslation } from "react-i18next";

export const ComparisonWidget = ({ props, setCustomActions }) => {
    const { t } = useTranslation("app_statistics");

    // 1. Extraemos los datos del backend con fallbacks de seguridad
    const selectedFilter = props?.selectedFilter || "Esta semana";
    const metrics = props?.metrics || [];

    // 3. Función auxiliar para asignar estilos e iconos según la dirección
    const getMetricStyles = (direction) => {
        switch (direction) {
            case "POSITIVE":
                return {
                    bg: "bg-primary-300",
                    Icon: IconTrendingUp,
                };
            case "NEGATIVE":
                return {
                    bg: "bg-tertiary-200",
                    Icon: IconTrendingDown,
                };
            case "NEUTRAL":
            default:
                return {
                    bg: "bg-primary-600",
                    Icon: IconMinus,
                };
        }
    };

    useEffect(() => {
        // Creamos los botones que queremos inyectar en el Header
        const actions = <TabsComponent widget="Comparison" t={t} />;

        // Se los pasamos al padre si la función existe
        if (setCustomActions) {
            setCustomActions(actions);
        }

        // Limpiamos al desmontar
        return () => setCustomActions?.(null);
    }, [setCustomActions]);

    if (!metrics.length) {
        return null;
    }

    return (
        <div className="h-full flex flex-col items-start justify-between w-full">
            {metrics.map((metric, index) => {
                const { bg, Icon } = getMetricStyles(metric.direction);

                return (
                    <div key={index} className="flex items-center gap-4 text-quaternary-700">
                        {/* Left-Aligned Icon Compartment */}
                        <div className={`${bg} p-2.5 rounded-2xl shadow-sm flex-shrink-0`}>
                            <Icon className={`h-4 w-4 md:h-7 md:w-7 text-primary`} />
                        </div>

                        {/* Right-Aligned Text Information */}
                        <div className="flex flex-col">
                            {/* Top Title */}
                            <span className="text-sm md:text-base font-medium text-quaternary-500 leading-none">
                                {metric.label}
                            </span>

                            {/* Bottom Value */}
                            <span className="text-lg md:text-xl font-bold -mt-1 leading-none">
                                {metric.displayValue}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

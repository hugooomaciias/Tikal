import DatabaseIcon from "../../assets/icons/databaseIcon.jsx";
import PlayIcon from "../../assets/icons/playIcon.jsx";
import StopIcon from "../../assets/icons/stopIcon.jsx";

export const TimeTracker = ({ className }) => {
    return (
        <div className={`h-auto w-full bg-secondary-800 rounded-3xl flex flex-col p-5 transform shadow-md ${className}`}>
            {/* Header Tarjeta */}
            <p className="text-primary text-2xl font-semibold">
                Time tracker
            </p>

            {/* Fila Tarea */}
            <div className="w-full flex items-center justify-between mt-4">
                <p className="text-primary-50 text-lg font-semibold truncate">
                    Hacer página web
                </p>
                <DatabaseIcon className="w-6 h-auto text-primary-50 flex-shrink-0" />
            </div>

            {/* Subtítulo */}
            <p className="text-primary-50 text-sm font-thin mb-4 truncate">
                Diseñar página de inicio
            </p>

            <div className="flex items-stretch justify-between gap-3">
                <div className="w-auto aspect-square flex flex-col justify-center bg-primary-50 rounded-2xl p-3">
                    <span className="text-secondary-800 text-2xl font-bold leading-none">
                        00h
                    </span>
                    <span className="text-secondary-800 text-xl font-light">
                        23:45
                    </span>
                </div>

                <div className="w-auto flex flex-col justify-between">
                    <div className="flex items-center justify-center bg-primary-50 rounded-full w-full aspect-square p-[6px] hover:bg-white transition-colors cursor-pointer group">
                        <PlayIcon className="w-[22px] h-auto text-secondary-800 group-hover:scale-110 transition-transform"/>
                    </div>

                    <div className="flex items-center justify-center bg-primary-50 rounded-full w-full aspect-square p-[6px] hover:bg-white transition-colors cursor-pointer group">
                        <StopIcon className="w-[22px] h-auto text-secondary-800 group-hover:scale-110 transition-transform"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeTracker;
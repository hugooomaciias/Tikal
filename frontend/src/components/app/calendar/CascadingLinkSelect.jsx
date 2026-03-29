import { useState, useRef, useEffect } from "react";

export const CascadingLinkSelect = ({ options, currentLinkId, onSelect, error, inputClass, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLinkTab, setActiveLinkTab] = useState("project");
    const [cascadingPath, setCascadingPath] = useState({
        project: "",
        phase: "",
        task: "",
    });

    const linkSelectorRef = useRef(null);

    // Clic fuera del componente para cerrarlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (linkSelectorRef.current && !linkSelectorRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lógica interna de selección
    const handleCascadingSelection = (option) => {
        if (option.type === "project") {
            setCascadingPath({ project: option.id, phase: "", task: "" });
            setActiveLinkTab("phase");
        } else if (option.type === "phase") {
            setCascadingPath((prev) => ({ ...prev, phase: option.id, task: "" }));
            setActiveLinkTab("task");
        } else if (option.type === "task") {
            setCascadingPath((prev) => ({ ...prev, task: option.id }));
        }

        // 🟢 Avisamos al padre (EventPopUp) de lo que hemos seleccionado
        onSelect(option);
    };

    const getPillWidth = () => {
        if (activeLinkTab === "project") return "w-[calc(33.333%-4px)]";
        if (activeLinkTab === "phase") return "w-[calc(66.666%-4px)]";
        return "w-[calc(100%-12px)]";
    };

    const currentSelectedItem = options.find((opt) => opt.id === currentLinkId);

    return (
        <div ref={linkSelectorRef} className="relative inline-block text-left shrink-0 w-full">
            <input
                type="text"
                id="linkId"
                name="linkId"
                placeholder=" "
                value={currentSelectedItem?.name || ""}
                readOnly
                onClick={() => setIsOpen(!isOpen)}
                className={`${inputClass} cursor-pointer`}
            />
            <label
                htmlFor="linkId"
                className="input-label input-textarea-label-primary cursor-pointer truncate max-w-[90%]"
            >
                {t("popup.linked.name")}
            </label>

            {error && (
                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">{error}</span>
            )}

            <div
                className={`absolute left-0 lg:right-0 lg:left-auto mt-2 w-full origin-top bg-primary-400 rounded-2xl shadow-xl text-primary z-50 overflow-hidden transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
            >
                {/* Botonera superior */}
                <div className="flex items-center justify-center w-full p-1.5 rounded-t-2xl relative overflow-hidden bg-primary-400">
                    <div
                        className={`absolute top-1.5 bottom-1.5 left-1.5 bg-primary-50 rounded-xl shadow-sm transition-all duration-300 ease-out z-0 ${getPillWidth()}`}
                    ></div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveLinkTab("project");
                        }}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "project" || activeLinkTab === "phase" || activeLinkTab === "task" ? "text-primary-400" : "text-primary"}`}
                    >
                        {t("popup.linked.projects")}
                    </button>
                    <button
                        type="button"
                        disabled={!cascadingPath.project}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveLinkTab("phase");
                        }}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "phase" || activeLinkTab === "task" ? "text-primary-400" : "text-primary"} ${!cascadingPath.project ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {t("popup.linked.stages")}
                    </button>
                    <button
                        type="button"
                        disabled={!cascadingPath.phase}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveLinkTab("task");
                        }}
                        className={`relative z-10 flex-1 py-2 text-sm font-semibold transition-colors duration-300 ${activeLinkTab === "task" ? "text-primary-400" : "text-primary"} ${!cascadingPath.phase ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {t("popup.linked.tasks")}
                    </button>
                </div>

                {/* Lista filtrada */}
                <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar p-2 gap-1 bg-primary-400">
                    {(() => {
                        const filteredOptions = options.filter((opt) => {
                            if (activeLinkTab === "project") return opt.type === "project";
                            if (activeLinkTab === "phase")
                                return opt.type === "phase" && opt.projectId === cascadingPath.project;
                            if (activeLinkTab === "task")
                                return opt.type === "task" && opt.phaseId === cascadingPath.phase;
                            return false;
                        });

                        return filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = cascadingPath[option.type] === option.id;
                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCascadingSelection(option);
                                        }}
                                        className={`px-3 py-2 text-sm font-medium text-left rounded-xl transition-colors flex items-center gap-2 ${isSelected ? "bg-primary-100/50 text-primary" : "text-primary hover:bg-primary-100/20"}`}
                                    >
                                        {option.color && (
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: option.color }}
                                            ></span>
                                        )}
                                        <span className="truncate">{option.name}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-xs text-center text-primary/70 py-3">No hay opciones en este nivel</p>
                        );
                    })()}
                </div>

                {/* Footer del Modal */}
                <div className="p-3 border-t border-primary-50/70 bg-primary-400 flex items-center justify-between">
                    <span className="text-xs font-medium text-primary/80 truncate max-w-[60%]">
                        {currentLinkId ? `${currentSelectedItem?.name}` : ""}
                    </span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className={`px-4 py-1.5 text-sm font-bold rounded-xl transition-all duration-200 ${currentLinkId ? "bg-primary-50 text-primary-500 shadow-sm" : "bg-transparent text-primary hover:bg-primary-50/20"}`}
                    >
                        {currentLinkId
                            ? t("popup.linked.button_message.confirm")
                            : t("popup.linked.button_message.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
};

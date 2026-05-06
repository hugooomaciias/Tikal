/** Icons */
import { IconCircleXFilled, IconNote } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../constants/phase_colours.js";
import tailwindConfig from "../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

export const ConfirmSwitchTaskComponent = ({
    pendingSwitchTask,
    taskName,
    projectIcon,
    activeColorId,
    cancelSwitchTask,
    confirmSwitchTask,
    activityDescription,
    setActivityDescription,
}) => {
    const OldIcon = projectIcon || PROJECTS_ICONS[0].component;
    const oldColor = PHASE_COLOURS.find((c) => c.id === activeColorId)?.hex || tailwindColors.primary[500];

    const NewIcon = pendingSwitchTask.logo || PROJECTS_ICONS[0].component;
    const newColor = PHASE_COLOURS.find((c) => c.id === pendingSwitchTask.colour)?.hex || tailwindColors.primary[500];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={cancelSwitchTask}
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="flex flex-col gap-2">
                    {/* Header: Dynamic Title and Close Action */}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-quaternary-700">Tarea en curso detectada</span>

                        <button
                            className="text-primary-500/70 hover:text-primary-500 transition-colors"
                            onClick={cancelSwitchTask}
                        >
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>

                    <span className="text-quaternary-500">
                        Actualmente tienes otra tarea activa. Si continúas, la tarea actual se pausará y se guardará
                        para iniciar la nueva tarea seleccionada.
                    </span>

                    {/* Task Summary Banner */}
                    <div className="flex flex-col items-center justify-between gap-2 mt-3">
                        <div className="w-full flex flex-col items-start rounded-xl text-quaternary-700">
                            <span className="text-sm font-bold">Tarea actual</span>

                            <div
                                className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-primary"
                                style={{ backgroundColor: oldColor }}
                            >
                                <OldIcon className="w-5 h-5" />
                                <span className="font-bold">{taskName}</span>
                            </div>
                        </div>

                        <div className="w-full flex flex-col items-start rounded-xl text-quaternary-700">
                            <span className="text-sm font-bold">Tarea seleccionada</span>

                            <div
                                className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-primary"
                                style={{ backgroundColor: newColor }}
                            >
                                <NewIcon className="w-5 h-5" />
                                <span className="font-bold">{pendingSwitchTask.name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-quaternary-500">
                        ¿A qué le has dedicado tiempo exactamente durante este último bloque en <b>{taskName}</b>?
                    </span>

                    {/* Activity Description Input */}
                    <div className="relative w-full">
                        <textarea
                            id="note"
                            name="note"
                            rows="4"
                            placeholder=" "
                            value={activityDescription}
                            onChange={(e) => setActivityDescription(e.target.value)}
                            required
                            className="textarea input-textarea-primary peer"
                        ></textarea>

                        <label htmlFor="note" className="textarea-label input-textarea-label-primary">
                            Descripción de la actividad realizada
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-start pt-3">
                            <IconNote className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Confirmation Action Button */}
                <div className="w-full flex items-center gap-3 mt-2">
                    <button
                        type="button"
                        onClick={cancelSwitchTask}
                        className="w-full btn bg-tertiary-200 text-primary"
                    >
                        <span>Cancelar</span>
                    </button>

                    <button type="button" onClick={confirmSwitchTask} className="w-full btn btn-primary">
                        <span>Confirmar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

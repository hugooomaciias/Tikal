import React, { useState } from "react";
import { IconCircleXFilled, IconWriting } from "@tabler/icons-react";

/** Config, Constants & Utils */
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

export const RenameComponent = ({ onClose, data, onRename }) => {
    const [newName, setNewName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newName.trim() === "") return;

        if (onRename) {
            onRename(data.id, { name: newName });
        }

        onClose();
    };

    const LogoComponent = data.logo ? PROJECTS_ICONS.find((i) => i.id === data.logo) || PROJECTS_ICONS[0] : null;
    const color = PHASE_COLOURS.find((c) => c.id === data.color);

    return (
        /* Modal Overlay Container */
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Evita que al hacer clic dentro se cierre
            >
                <div className="flex flex-col gap-2">
                    {/* Header: Title and Close Action */}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-quaternary-700">Renombrar Evento</span>

                        <button
                            type="button"
                            className="text-primary-500/70 hover:text-primary-500 transition-colors"
                            onClick={onClose}
                        >
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>

                    {/* Banner del Evento Actual */}
                    <div
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 mt-4 rounded-xl text-primary shadow-sm"
                        style={{ backgroundColor: color?.hex || tailwindColors.primary[500] }}
                    >
                        {LogoComponent && <LogoComponent.component className="w-5 h-5" />}
                        <span className="font-bold">{data?.title}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                    {/* Input de Nombre (Usamos 'input' simple, no 'textarea') */}
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="newName"
                            name="newName"
                            placeholder=" "
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            className="input input-textarea-primary peer"
                        />

                        <label htmlFor="newName" className="input-label input-textarea-label-primary">
                            Nuevo nombre
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-center">
                            <IconWriting className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Confirmation Action Button */}
                    <button
                        type="submit"
                        className="btn btn-primary md:min-w-1/2 mx-auto"
                        disabled={newName.trim() === ""}
                    >
                        <span>Renombrar</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

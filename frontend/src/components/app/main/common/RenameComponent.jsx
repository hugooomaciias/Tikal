/** React & Third-Party Libraries */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import resolveConfig from "tailwindcss/resolveConfig";

/** Components & Layouts */
import { ScrollingText } from "./ScrollingText.jsx";

/** Icons */
import { IconCircleXFilled, IconWriting } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import { PROJECTS_ICONS } from "../../../../constants/projects_icons.js";
import { PHASE_COLOURS } from "../../../../constants/phase_colours.js";
import tailwindConfig from "../../../../../tailwind.config.js";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const tailwindColors = fullConfig.theme.colors;

/**
 * Rename Modal Component
 *
 * This component is primarily visual, rendering a modal that prompts the user
 * to input a new name for a specific entity. It manages minimal local state (`newName`)
 * exclusively for tracking the controlled input and resolving the target's logo/colors,
 * bypassing the need to over-engineer a dedicated headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal without renaming.
 * @param {Object} props.data - Data object containing the target entity's details (id, title, color, logo).
 * @param {Function} props.onRename - Callback function triggered to execute the renaming action.
 * @returns {JSX.Element} The rendered rename modal overlay.
 */
export const RenameComponent = ({ iaModule, onClose, data, onRename }) => {
    // --- 1. Local UI Logic ---

    /**
     * Translation Hook
     *
     * Injects the translation function scoped to the common application namespace.
     */
    const { t } = useTranslation("app_common");

    /**
     * Input Value State
     *
     * Tracks the string value of the controlled input field for the new entity name.
     */
    const [newName, setNewName] = useState("");

    /**
     * Form Submission Handler
     *
     * Prevents default form submission, validates that the input is not empty,
     * triggers the rename callback with the new payload, and subsequently closes the modal.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newName.trim() === "") return;

        if (onRename) {
            onRename(data.id, { name: newName });
        }

        onClose();
    };

    /**
     * Target Entity Logo Model
     *
     * Resolves the full icon metadata block for the entity, defaulting to a fallback if necessary.
     */
    const logo = data.logo ? PROJECTS_ICONS.find((i) => i.id === data.logo) || PROJECTS_ICONS[0] : null;

    /**
     * Target Entity Icon Component
     *
     * Extracts the specific React icon component from the resolved logo metadata.
     */
    const LogoComponent = logo ? logo.component : null;

    /**
     * Target Entity Color
     *
     * Resolves the specific hex color representation associated with the entity's phase/project.
     */
    const color = PHASE_COLOURS.find((c) => c.id === data.color);

    // --- 2. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content Container */}
            <div
                className={`relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 ${iaModule ? "bg-primary-800/80 border border-primary-700/50 backdrop-blur-sm" : "bg-primary-50"}  rounded-[2.5rem] p-8 animate-fade-in-up`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Information Section */}
                <div className="flex flex-col gap-2">
                    {/* Header: Title and Close Action */}
                    <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${iaModule ? "text-primary" : "text-quaternary-700"} `}>
                            {iaModule ? t("rename.title.ia") : t("rename.title.event")}
                        </span>

                        <button
                            type="button"
                            className={`${iaModule ? "text-primary/70 hover:text-primary" : "text-primary-500/70 hover:text-primary-500"} transition-colors`}
                            onClick={onClose}
                        >
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>

                    {/* Target Entity Information Banner */}
                    <div
                        className={`w-full flex items-center ${iaModule ? "justify-center text-primary-600" : "justify-between text-primary"} gap-3 py-3 px-4 mt-4 rounded-xl shadow-sm`}
                        style={{ backgroundColor: color ? color?.hex : iaModule ? tailwindColors.primary[50] : tailwindColors.primary[500] }}
                    >
                        {/* Entity Logo */}
                        {LogoComponent && <LogoComponent className="w-5 h-5" />}

                        {/* Entity Title */}
                        <ScrollingText className={`font-bold ${iaModule ? "text-center" : "text-end"}`} text={data?.title} />
                    </div>
                </div>

                {/* Rename Form Section */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                    {/* Input Field Wrapper */}
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
                            {t("rename.input_label")}
                        </label>

                        {/* Input Icon Decorator */}
                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-center">
                            <IconWriting className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Confirmation Action Button */}
                    <button
                        type="submit"
                        className={`btn md:min-w-1/2 mx-auto ${iaModule ? "bg-gradient-to-r from-primary-200 to-primary-500 text-primary" : "btn-primary"}`}
                        disabled={newName.trim() === ""}
                    >
                        <span>{t("rename.button")}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

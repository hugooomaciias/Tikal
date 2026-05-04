/** React & Third-Party Libraries */
import React from "react";

/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";

/** Icons */
import { IconCircleXFilled, IconAlertTriangle } from "@tabler/icons-react";

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

/**
 * Delete Modal Component
 *
 * A confirmation modal that prompts the user to verify the deletion of a specific event.
 * Displays the event's title and color for visual confirmation before triggering the
 * deletion callback.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object} props.data - Data object containing the target event's details (id, title, color).
 * @param {Function} props.onDelete - Callback function triggered to confirm and execute the deletion.
 * @returns {JSX.Element} The rendered deletion confirmation modal.
 */
export const DeleteComponent = ({ onClose, data, onDelete }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_common"
     * namespace for localized text content within the modal.
     */
    const { t } = useTranslation("app_common");

    // --- 5. Event Handlers & Functions ---

    /**
     * Deletion Confirmation Handler
     *
     * Triggers the provided `onDelete` callback with the current event's ID,
     * then automatically closes the modal overlay.
     *
     * @returns {void}
     */
    const handleDelete = () => {
        if (onDelete) {
            onDelete(data.id);
        }

        onClose();
    };

    const logo = PROJECTS_ICONS.find((i) => i.id === data.logo) || PROJECTS_ICONS[0];
    const color = PHASE_COLOURS.find((c) => c.id === data.color);

    // --- 6. Render ---

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-4 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Title */}
                <span className="text-2xl font-bold text-quaternary-700">{t("context_menu.delete.modal.title")}</span>

                {/* Warning Message Section */}
                <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <IconAlertTriangle className="w-12 h-12 text-tertiary-200" stroke={1.5} />
                    <p className="text-quaternary-500 font-medium leading-relaxed">
                        {t("context_menu.delete.modal.description")}
                    </p>
                </div>

                {/* Target Event Info Banner */}
                <div
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 mt-4 rounded-xl text-primary shadow-sm"
                    style={{ backgroundColor: color?.hex || tailwindColors.primary[500] }}
                >
                    <logo.component className="w-5 h-5" />
                    <span className="font-bold">{data?.title}</span>
                </div>

                {/* Action Buttons: Cancel & Confirm */}
                <div className="flex items-center justify-between gap-4 mt-2">
                    <button type="button" onClick={onClose} className="w-full btn text-primary bg-primary-200">
                        {t("context_menu.delete.modal.cancel")}
                    </button>
                    <button type="button" onClick={handleDelete} className="w-full btn text-primary bg-tertiary-200">
                        {t("context_menu.delete.modal.delete")}
                    </button>
                </div>
            </div>
        </div>
    );
};

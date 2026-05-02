/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";

/** Icons */
import {
    IconWriting,
    IconWritingFilled,
    IconEdit,
    IconEditFilled,
    IconTrash,
    IconTrashFilled,
} from "@tabler/icons-react";

/**
 * Context Menu Component
 *
 * This component renders a custom right-click context menu offering common actions
 * like Rename, Edit, and Delete. It handles its own spatial positioning, outside-click
 * closure, and mobile responsiveness.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.RefObject} props.contextMenuRef - Reference to the context menu DOM node for tracking interactions.
 * @param {Object} props.contextMenuState - Contains the active state and coordinates (`x`, `y`) of the menu.
 * @param {Object} props.contextMenuActions - Dictionary of handler functions (`closeContextMenu`, `handleActionRename`, `handleActionEdit`, `handleActionDelete`).
 * @returns {JSX.Element} The rendered context menu overlay and dialog.
 */
export const ContextMenuComponent = ({ contextMenuRef, contextMenuState, contextMenuActions }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance scoped to the "app_common"
     * namespace for localized text content within the modal.
     */
    const { t } = useTranslation("app_common");

    // --- 3. Derived Variables ---

    /**
     * Mobile Viewport Flag
     *
     * Evaluates if the current window width is under the 768px threshold,
     * used to apply responsive translations to the context menu.
     */
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // --- 5. Event Handlers & Functions ---

    /**
     * Background Click Handler
     *
     * Stops event propagation and triggers the close action when the user clicks
     * outside the context menu bounds.
     *
     * @param {React.MouseEvent} e - The native mouse down event.
     */
    const handleBackgroundClick = (e) => {
        e.stopPropagation();
        contextMenuActions.closeContextMenu();
    };

    /**
     * Background Context Menu Preventer
     *
     * Prevents the native browser context menu from appearing when right-clicking
     * on the background overlay, while also closing the custom menu.
     *
     * @param {React.MouseEvent} e - The native context menu event.
     */
    const handleBackgroundContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        contextMenuActions.closeContextMenu();
    };

    /**
     * Menu Mouse Leave Handler
     *
     * Automatically closes the context menu when the cursor moves off its surface.
     */
    const handleMouseLeave = () => {
        contextMenuActions.closeContextMenu();
    };

    // --- 6. Render ---

    return (
        <>
            {/* Full Screen Dismissal Overlay */}
            <div
                className="fixed inset-0 z-[990]"
                onMouseDown={handleBackgroundClick}
                onContextMenu={handleBackgroundContextMenu}
            />

            {/* Context Menu Container */}
            <div
                ref={contextMenuRef}
                className="fixed z-[1000] bg-primary rounded-xl shadow-2xl border-2 border-primary-200 flex flex-col"
                style={{
                    top: contextMenuState.contextMenu.y,
                    left: contextMenuState.contextMenu.x,
                    transform: isMobile ? "translateX(-100%)" : "none",
                }}
                onMouseLeave={handleMouseLeave}
            >
                {/* Rename Action Button */}
                <button
                    onClick={contextMenuActions.handleActionRename}
                    className="group flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm md:text-base text-quaternary-700 font-medium hover:bg-primary-100/30"
                >
                    {/* Default Icon */}
                    <IconWriting
                        className="w-5 h-5 md:w-6 md:h-6 block text-primary-200 group-hover:hidden transition-all"
                        stroke={1.5}
                    />

                    {/* Hover Active Icon */}
                    <IconWritingFilled
                        className="w-5 h-5 md:w-6 md:h-6 hidden group-hover:block text-primary-200 transition-all"
                        stroke={1.5}
                    />

                    <span>{t("context_menu.rename")}</span>
                </button>

                {/* Edit Action Button */}
                <button
                    onClick={contextMenuActions.handleActionEdit}
                    className="group flex items-center gap-2 px-4 py-3 text-sm md:text-base text-quaternary-700 font-medium hover:bg-primary-100/30"
                >
                    {/* Default Icon */}
                    <IconEdit
                        className="w-5 h-5 md:w-6 md:h-6 block text-primary-200 group-hover:hidden transition-all"
                        stroke={1.5}
                    />

                    {/* Hover Active Icon */}
                    <IconEditFilled
                        className="w-5 h-5 md:w-6 md:h-6 hidden group-hover:block text-primary-200 transition-all"
                        stroke={1.5}
                    />

                    <span>{t("context_menu.edit")}</span>
                </button>

                <hr className="w-[95%] mx-auto my-1 border-primary-100" />

                {/* Delete Action Button */}
                <button
                    onClick={contextMenuActions.handleActionDelete}
                    className="group flex items-center gap-2 px-4 py-3 rounded-b-xl text-sm md:text-base text-quaternary-700 font-medium hover:bg-tertiary-100/30"
                >
                    {/* Default Icon */}
                    <IconTrash
                        className="w-5 h-5 md:w-6 md:h-6 block text-tertiary-200 group-hover:hidden transition-all"
                        stroke={1.5}
                    />

                    {/* Hover Active Icon */}
                    <IconTrashFilled
                        className="w-5 h-5 md:w-6 md:h-6 hidden group-hover:block text-tertiary-200 transition-all"
                        stroke={1.5}
                    />

                    <span>{t("context_menu.delete.name")}</span>
                </button>
            </div>
        </>
    );
};

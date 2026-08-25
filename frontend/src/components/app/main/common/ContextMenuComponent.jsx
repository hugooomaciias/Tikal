/** React & Third-Party Libraries */
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
 * This component is primarily visual, rendering a custom right-click context menu offering
 * common actions like Rename, Edit, and Delete. It manages minimal local logic exclusively for UI
 * interactions (e.g., handling click-away dismissals and mobile positioning), avoiding the need
 * to extract these simple layout behaviors into a separate headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.RefObject} props.contextMenuRef - Reference to the context menu DOM node for tracking layout.
 * @param {Object} props.contextMenuState - Contains the active state and coordinates (`x`, `y`) of the menu.
 * @param {Object} props.contextMenuActions - Dictionary of handler functions (`closeContextMenu`, `handleActionRename`, `handleActionEdit`, `handleActionDelete`).
 * @returns {JSX.Element} The rendered context menu overlay and dialog.
 */
export const ContextMenuComponent = ({ iaModule, contextMenuRef, contextMenuStates, contextMenuActions }) => {
    // --- 1. Local UI Logic ---

    /**
     * Localization Hook
     *
     * Injects the translation function scoped to the common application namespace.
     */
    const { t } = useTranslation("app_common");

    /**
     * Mobile Viewport State
     *
     * Detects if the current viewport is mobile-sized to dynamically adjust the context menu's translation.
     */
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    /**
     * Background Click Handler
     *
     * Prevents event bubbling and triggers the menu dismissal when clicking outside the context menu.
     */
    const handleBackgroundClick = (e) => {
        e.stopPropagation();
        contextMenuActions.closeContextMenu();
    };

    /**
     * Background Context Menu Handler
     *
     * Prevents the native browser context menu from appearing when right-clicking the overlay, and dismisses the custom menu.
     */
    const handleBackgroundContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        contextMenuActions.closeContextMenu();
    };

    /**
     * Mouse Leave Handler
     *
     * Automatically closes the context menu when the user's cursor exits the menu area.
     */
    const handleMouseLeave = () => {
        contextMenuActions.closeContextMenu();
    };

    // --- 2. Render ---

    return (
        <>
            {/* Full Screen Dismissal Overlay */}
            <div
                className="fixed inset-0 z-[990]"
                onMouseDown={handleBackgroundClick}
                onContextMenu={handleBackgroundContextMenu}
            />

            {/* Context Menu Main Container */}
            <div
                ref={contextMenuRef}
                className={`fixed z-[1000] rounded-xl shadow-2xl ${!iaModule ? "bg-primary border-2 border-primary-200" : "bg-primary-50"} flex flex-col`}
                style={{
                    top: contextMenuStates.contextMenu.y,
                    left: contextMenuStates.contextMenu.x,
                    transform: isMobile ? "translateX(-100%)" : "none",
                }}
                onMouseLeave={handleMouseLeave}
            >
                {/* Rename Action Section */}
                <button
                    type="button"
                    onClick={contextMenuActions.handleActionRename}
                    className="group flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm md:text-base text-quaternary-700 font-medium hover:bg-primary-100/30"
                >
                    {/* Default Icon */}
                    <IconWriting
                        className={`w-5 h-5 md:w-6 md:h-6 block ${iaModule ? "text-primary-600" : "text-primary-200"} group-hover:hidden transition-all`}
                        stroke={1.5}
                    />

                    {/* Hover Active Icon */}
                    <IconWritingFilled
                        className={`w-5 h-5 md:w-6 md:h-6 hidden group-hover:block ${iaModule ? "text-primary-600" : "text-primary-200"} transition-all`}
                        stroke={1.5}
                    />

                    <span>{t("context_menu.rename")}</span>
                </button>

                {/* Edit Action Section */}
                {!iaModule && (
                    <button
                        type="button"
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
                )}

                {/* Divider */}
                {!iaModule && (
                    <hr className="w-[95%] mx-auto my-1 border-primary-100" />
                )}

                {/* Delete Action Section */}
                <button
                    type="button"
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

                    <span>{t("context_menu.delete")}</span>
                </button>
            </div>
        </>
    );
};

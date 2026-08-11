/** React & Third-Party Libraries */
import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Context Menu Logic Hook
 *
 * This Headless hook abstracts the state, coordinate positioning, data normalization,
 * and interaction handlers for the universally accessible context menu component.
 * It encapsulates the complexities of right-click handling, boundary detection,
 * and dispatching cascading modal events (edit, rename, delete) across the UI.
 *
 * @hook
 * @param {Function} handleEventClick - Injected action handler to dispatch edit workflows when the context menu "Edit" button is clicked.
 * @returns {Object} A structured payload containing DOM refs, menu states, and interaction handlers.
 */
export const useContextMenu = (handleEventClick) => {
    // --- 1. DOM Refs & Layout State ---

    /**
     * Context Menu DOM Reference
     *
     * Maintains a mutable reference to the underlying DOM node of the context menu.
     * Required to evaluate click coordinates and trigger the "click outside" dismissal logic.
     */
    const contextMenuRef = useRef(null);

    // --- 2. Local UI State ---

    /**
     * Context Menu Positional State
     *
     * Tracks the visibility, spatial coordinates (x, y) relative to the viewport,
     * and the raw target data payload attached to the entity that was right-clicked.
     */
    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        data: null,
    });

    /**
     * Entity Rename State
     *
     * Stores the normalized data payload of the specific entity flagged for a renaming action.
     * When populated, this state implicitly triggers the RenameComponent modal in the parent UI.
     */
    const [entityToRename, setEntityToRename] = useState(null);

    /**
     * Entity Delete State
     *
     * Stores the normalized data payload of the specific entity flagged for deletion.
     * When populated, this state implicitly triggers the DeleteComponent modal in the parent UI.
     */
    const [entityToDelete, setEntityToDelete] = useState(null);

    // --- 4. Side Effects ---

    /**
     * Outside Click Listener
     *
     * Binds a global event listener to the document and window scroll strictly when the context menu is visible.
     * Evaluates click coordinates against the `contextMenuRef` boundary to automatically dismiss the menu
     * if the user interacts elsewhere in the application. Cleans up gracefully to prevent memory leaks.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu((prev) => ({ ...prev, visible: false }));
            }
        };

        if (contextMenu.visible) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleClickOutside, { passive: true });
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleClickOutside);
        };
    }, [contextMenu.visible]);

    // --- 5. Interaction Handlers ---

    /**
     * Data Normalization Helper
     *
     * Standardizes arbitrary data payloads coming from different components (e.g., FullCalendar events vs standard lists)
     * into a predictable object schema containing an ID, title, color, and logo.
     *
     * @param {Object} rawEventData - The unformatted entity payload originating from the context trigger.
     * @returns {Object|null} The normalized entity object, or null if no data was provided.
     */
    const getNormalizedEntityData = (rawEventData) => {
        if (!rawEventData) return null;

        const isFromCalendar = rawEventData.event;
        const entity = isFromCalendar ? rawEventData.event : rawEventData;

        const entityTitle = entity.title || entity.name || "";

        let entityColor = "";
        let entityLogo = entity.extendedProps ? entity.extendedProps.logo : entity.logo;

        if (entity.extendedProps && entity.extendedProps.color) {
            entityColor = entity.extendedProps.color;
        } else if (entity.colour) {
            entityColor = entity.colour;
        }

        return {
            id: entity.id,
            title: entityTitle,
            color: entityColor,
            logo: entityLogo,
            originalEntity: entity,
        };
    };

    /**
     * Context Menu Initialization Handler
     *
     * Memoized to maintain referential integrity when passed to deep child nodes.
     * Suppresses the default browser context menu and captures the client cursor coordinates
     * to accurately inject the custom context menu at the point of interaction.
     *
     * @param {Event} e - The native DOM synthetic event triggered by the right-click action.
     * @param {Object} eventObj - The attached metadata of the targeted entity.
     */
    const handleContextMenu = useCallback((e, eventObj) => {
        e.preventDefault();
        e.stopPropagation();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            data: eventObj,
        });
    }, []);

    /**
     * Context Menu Dismissal Handler
     *
     * Memoized to avoid unnecessary reallocation. Resets the context menu state payload
     * to its default values, effectively hiding the component from the DOM.
     */
    const closeContextMenu = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0, data: null });
    }, []);

    /**
     * Rename Action Dispatcher
     *
     * Memoized to rely safely on the active context state. Parses the target data payload,
     * normalizes its structure, populates the `entityToRename` state to trigger the rename modal,
     * and dismisses the context menu.
     *
     * @param {Object|Event} entityOverride - Optional direct entity payload or click event overriding the context state.
     */
    const handleActionRename = useCallback(
        (entityOverride) => {
            const isEvent = entityOverride && typeof entityOverride.stopPropagation === "function";
            const targetData = !isEvent && entityOverride ? entityOverride : contextMenu.data;

            const normalizedData = getNormalizedEntityData(targetData);

            if (normalizedData) {
                setEntityToRename(normalizedData);
            }

            closeContextMenu();
        },
        [contextMenu.data, closeContextMenu],
    );

    /**
     * Edit Action Dispatcher
     *
     * Memoized to optimize dependency tracing. Validates the target payload and
     * invokes the externally injected `handleEventClick` parent function to initiate
     * the standard edit workflow before dismissing the context menu.
     *
     * @param {Object|Event} entityOverride - Optional direct entity payload or click event overriding the context state.
     */
    const handleActionEdit = useCallback(
        (entityOverride) => {
            const isEvent = entityOverride && typeof entityOverride.stopPropagation === "function";
            const targetData = !isEvent && entityOverride ? entityOverride : contextMenu.data;

            if (targetData) {
                handleEventClick(targetData);
            }

            closeContextMenu();
        },
        [contextMenu.data, handleEventClick, closeContextMenu],
    );

    /**
     * Delete Action Dispatcher
     *
     * Memoized to cleanly isolate the deletion context. Evaluates the active entity payload,
     * normalizes it, populates the `entityToDelete` state to trigger the destructive warning modal,
     * and hides the context menu.
     *
     * @param {Object|Event} entityOverride - Optional direct entity payload or click event overriding the context state.
     */
    const handleActionDelete = useCallback(
        (entityOverride) => {
            const isEvent = entityOverride && typeof entityOverride.stopPropagation === "function";
            const targetData = !isEvent && entityOverride ? entityOverride : contextMenu.data;

            const normalizedData = getNormalizedEntityData(targetData);

            if (normalizedData) {
                setEntityToDelete(normalizedData);
            }

            closeContextMenu();
        },
        [contextMenu.data, closeContextMenu],
    );

    const closeRenameModal = useCallback(() => {
        setEntityToRename(null);
    }, []);

    /**
     * Close Delete Modal
     *
     * Semantically closes the deletion confirmation modal by clearing its active payload.
     */
    const closeDeleteModal = useCallback(() => {
        setEntityToDelete(null);
    }, []);

    // --- 6. Return Object ---

    return {
        contextMenuRef,
        contextMenuStates: {
            contextMenu,
            entityToRename,
            entityToDelete,
            activeEntityId: entityToRename?.id,
        },
        contextMenuActions: {
            closeRenameModal,
            closeDeleteModal,
            handleContextMenu,
            closeContextMenu,
            handleActionRename,
            handleActionEdit,
            handleActionDelete,
        },
    };
};

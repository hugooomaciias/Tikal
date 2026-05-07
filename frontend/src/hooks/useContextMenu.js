import React, { useState, useCallback, useRef, useEffect } from "react";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../constants/phase_colours.js";

export const useContextMenu = (handleEventClick) => {
    const contextMenuRef = useRef(null);

    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        data: null,
    });

    const [entityToRename, setEntityToRename] = useState(null);
    const [entityToDelete, setEntityToDelete] = useState(null);

    /**
     * Outside Click Listener
     *
     * Attaches a global `mousedown` event listener to the document whenever the dropdown is open and not disabled.
     * Evaluates click targets against the `pickerRef` boundary, automatically closing the menu if the click occurs outside.
     * Cleans up the listener on unmount or when dependencies change to prevent memory leaks.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the menu is open, the ref exists, AND the click was outside of it
            if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setContextMenu((prev) => ({ ...prev, visible: false }));
            }
        };

        if (contextMenu.visible) {
            // Using mousedown instead of click to match PickerComponent exactly
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleClickOutside, { passive: true });
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleClickOutside);
        };
    }, [contextMenu.visible]);

    const getNormalizedEntityData = (rawEventData) => {
        if (!rawEventData) return null;

        const isFromCalendar = Boolean(rawEventData.event);
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

    const closeContextMenu = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0, data: null });
    }, []);

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

    return {
        contextMenuRef,
        contextMenuState: {
            contextMenu,
            entityToRename,
            entityToDelete,
            activeEntityId: contextMenu.data?.id || null,
        },
        contextMenuActions: {
            setContextMenu,
            setEntityToRename,
            setEntityToDelete,
            handleContextMenu,
            closeContextMenu,
            handleActionRename,
            handleActionEdit,
            handleActionDelete,
        },
    };
};

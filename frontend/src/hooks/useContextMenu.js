import React, { useState, useCallback, useRef, useEffect } from "react";

/** Config, Constants & Utils */
import { PHASE_COLOURS } from "../constants/phase_colours.js";

export const useContextMenu = (handleEventClick) => {
    const contextMenuRef = useRef(null);

    const [contextMenu, setContextMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
        eventData: null,
    });

    const [eventToRename, setEventToRename] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);

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

    const handleContextMenu = useCallback((e, eventObj) => {
        e.preventDefault();
        e.stopPropagation();

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            eventData: eventObj,
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu({ visible: false, x: 0, y: 0, eventData: null });
    }, []);

    const handleActionRename = useCallback(() => {
        if (contextMenu.eventData) {
            // Extraemos los datos de forma segura (igual que en handleEventClick)
            const isFromCalendar = Boolean(contextMenu.eventData.event);
            const event = isFromCalendar ? contextMenu.eventData.event : contextMenu.eventData;

            let colorObj = PHASE_COLOURS[0];
            if (event.extendedProps && event.extendedProps.color) {
                colorObj = event.extendedProps.color;
            }

            // Seteamos el evento para el modal de renombrar
            setEventToRename({
                id: event.id,
                title: event.title,
                color: colorObj,
            });
        }

        closeContextMenu();
    }, [contextMenu.eventData, closeContextMenu]);

    const handleActionEdit = useCallback(() => {
        if (contextMenu.eventData) {
            handleEventClick(contextMenu.eventData);
        }

        closeContextMenu();
    }, [contextMenu.eventData, handleEventClick, closeContextMenu]);

    const handleActionDelete = useCallback(() => {
        if (contextMenu.eventData) {
            const isFromCalendar = Boolean(contextMenu.eventData.event);
            const event = isFromCalendar ? contextMenu.eventData.event : contextMenu.eventData;

            let colorObj = PHASE_COLOURS[0];
            if (event.extendedProps && event.extendedProps.color) {
                colorObj = event.extendedProps.color;
            }

            setEventToDelete({
                id: event.id,
                title: event.title,
                color: colorObj,
            });
        }
        closeContextMenu();
    }, [contextMenu.eventData, closeContextMenu]);

    return {
        contextMenuRef,
        contextMenuState: {
            contextMenu,
            eventToRename,
            eventToDelete,
        },
        contextMenuActions: {
            setContextMenu,
            setEventToRename,
            setEventToDelete,
            handleContextMenu,
            closeContextMenu,
            handleActionRename,
            handleActionEdit,
            handleActionDelete,
        },
    };
};

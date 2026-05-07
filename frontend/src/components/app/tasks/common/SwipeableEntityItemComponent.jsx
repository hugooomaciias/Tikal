/** React & Third-Party Libraries */
import { useState, useRef } from "react";

/** Icons */
import { IconEdit, IconWriting, IconTrash } from "@tabler/icons-react";

export const SwipeableEntityItemComponent = ({ entity, contextMenuActions, children }) => {
    const [offset, setOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startX = useRef(0);
    const startOffset = useRef(0);

    // Constantes de distancia (en píxeles)
    const RIGHT_ACTIONS_WIDTH = -120; // Ancho para Renombrar + Eliminar (deslizar a la izquierda)
    const LEFT_ACTIONS_WIDTH = 60; // Ancho para Editar (deslizar a la derecha)

    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
        startOffset.current = offset;
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startX.current;
        let newOffset = startOffset.current + deltaX;

        // Limitamos hasta dónde se puede arrastrar visualmente
        if (newOffset > LEFT_ACTIONS_WIDTH + 20) newOffset = LEFT_ACTIONS_WIDTH + 20;
        if (newOffset < RIGHT_ACTIONS_WIDTH - 20) newOffset = RIGHT_ACTIONS_WIDTH - 20;

        setOffset(newOffset);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Efecto "Snap" (imán): si pasas de cierto umbral, se abre. Si no, se cierra.
        if (offset > LEFT_ACTIONS_WIDTH / 2) {
            setOffset(LEFT_ACTIONS_WIDTH); // Se queda abierto a la izquierda (muestra Editar)
        } else if (offset < RIGHT_ACTIONS_WIDTH / 2) {
            setOffset(RIGHT_ACTIONS_WIDTH); // Se queda abierto a la derecha (muestra Renombrar/Borrar)
        } else {
            setOffset(0); // Se cierra
        }
    };

    // Funciones envolventes que cierran el menú deslizante al hacer clic en una acción
    const handleActionClick = (e, actionType) => {
        e.stopPropagation();
        setOffset(0);

        // Seteamos silenciosamente la entidad activa en el hook
        contextMenuActions.setContextMenu({ visible: false, x: 0, y: 0, data: entity });

        // Y disparamos la acción correspondiente que abrirá el modal adecuado
        if (actionType === "edit") {
            contextMenuActions.handleActionEdit(entity);
        } else if (actionType === "rename") {
            contextMenuActions.handleActionRename(entity);
        } else if (actionType === "delete") {
            contextMenuActions.handleActionDelete(entity);
        }
    };

    return (
        <div className={`relative w-full rounded-[2rem] touch-pan-y shrink-0 ${offset !== 0 ? "overflow-hidden" : ""}`}>
            {/* CAPA DE FONDO: Botones de Acción */}
            <div
                className={`absolute inset-0 flex justify-between items-center w-full h-full bg-primary-300 transition-opacity duration-75 ${
                    offset === 0 ? "opacity-0" : "opacity-100"
                }`}
            >
                {/* Acción Izquierda: Editar */}
                <div
                    className="flex items-center justify-start h-full pl-5 w-1/2 bg-primary-300 text-primary cursor-pointer"
                    onClick={(e) => handleActionClick(e, "edit")}
                >
                    <IconEdit className="w-6 h-6" />
                </div>

                {/* Acciones Derechas: Renombrar y Eliminar */}
                <div className="flex items-center justify-end w-1/2 h-full">
                    <div
                        className="flex items-center justify-center h-full pl-4 pr-5 bg-primary-300 text-primary cursor-pointer"
                        onClick={(e) => handleActionClick(e, "rename")}
                    >
                        <IconWriting className="w-6 h-6" />
                    </div>
                    <div
                        className="flex items-center justify-center h-full pl-4 pr-5 bg-tertiary-200 text-primary cursor-pointer"
                        onClick={(e) => handleActionClick(e, "delete")}
                    >
                        <IconTrash className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* CAPA FRONTAL: Tarjeta del Proyecto */}
            <div
                className={`relative w-full h-full bg-primary rounded-[2rem] ${offset !== 0 ? "shadow-[-4px_0_15px_rgba(0,0,0,0.08)]" : ""} ${!isDragging ? "transition-transform duration-300 ease-out" : ""}`}
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};

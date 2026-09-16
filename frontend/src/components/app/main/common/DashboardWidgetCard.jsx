/** React & Third-Party Libraries */
import React from "react";

/** Components & Layouts */
import { BaseWidget } from "./widgets/BaseWidget";

/** Icons */
import { IconCircleXFilled } from "@tabler/icons-react";

/**
 * Global Dashboard Widget Card Component
 *
 * A purely presentational wrapper component for individual dashboard widgets across the app.
 * It intelligently handles edit-mode UI overlays (delete buttons, drag handles) if enabled, 
 * and delegates the actual content rendering to the underlying `BaseWidget`.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.widget - The full configuration and grid payload of the widget.
 * @param {boolean} [props.isEditing=false] - Flag indicating if the dashboard is in edit mode.
 * @param {boolean} [props.isMobile=false] - Flag indicating if the viewport is mobile.
 * @param {Function} [props.onRemove] - Callback triggered to delete the widget.
 * @param {Function} props.t - Translation function.
 */
export const DashboardWidgetCard = ({ widget, isEditing = false, isMobile = false, onRemove, t }) => {
    const allowsDrag = widget.grid?.isDraggable !== false;
    const allowsResize = widget.grid?.isResizable !== false;
    const isModifiable = isEditing && (allowsDrag || allowsResize);

    return (
        <div className="relative group h-full w-full">
            {/* Edit Mode Controls Overlay (Delete) */}
            {isModifiable && onRemove && (
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => onRemove(widget.id)}
                    title="Eliminar widget"
                    className="absolute z-50 -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center transition-all duration-300"
                >
                    <IconCircleXFilled className="w-full h-full text-tertiary-200/70 hover:text-tertiary-200" />
                </button>
            )}

            {/* Drag Handle Overlay (Only on Desktop Grid) */}
            {isEditing && allowsDrag && !isMobile && (
                <div className="absolute inset-0 z-40 cursor-move rounded-3xl" />
            )}

            {/* Dynamic Widget Injection Component */}
            <BaseWidget
                t={t}
                title={widget.config.title}
                subtitle={widget.config.subtitle}
                bgColor={widget.config.bgColor}
                textColor={widget.config.textColor}
                actions={widget.config.actions}
                pageLink={widget.config.pageLink}
                className={`transition-all duration-300 w-full h-full ${
                    isModifiable && !isMobile 
                        ? `opacity-60 border-dashed border-[3px] ${widget.config.borderColor ? widget.config.borderColor : "border-primary-50"} cursor-move` 
                        : "opacity-100"
                }`}
            >
                {widget.config.content && (
                    <widget.config.content.component props={widget.config.content.props} />
                )}
            </BaseWidget>
        </div>
    );
};
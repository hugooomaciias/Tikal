/** React & Third-Party Libraries */
import { useState, useRef } from "react";

/** Icons */
import { IconEdit, IconWriting, IconTrash } from "@tabler/icons-react";

/** Assets, Utils & Constants */
const RIGHT_ACTIONS_WIDTH = -120;
const LEFT_ACTIONS_WIDTH = 60;

/**
 * Swipeable Entity Item Component
 *
 * A primarily visual hybrid component that provides a mobile-friendly swipeable
 * container for entity list items (like tasks or stages). It manages minimal local state
 * exclusively to track touch coordinates and visual X-axis offsets, revealing hidden
 * action buttons (Edit, Rename, Delete) beneath the content.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.entity - The data object representing the current item being swiped.
 * @param {Object} props.contextMenuActions - The action handlers injected from the parent's context menu logic.
 * @param {React.ReactNode} props.children - The actual visible entity card content to be wrapped and rendered.
 * @returns {JSX.Element} The rendered swipeable wrapper.
 */
export const SwipeableEntityItemComponent = ({ entity, contextMenuActions, children }) => {
    // --- 1. Local UI Logic ---

    console.log(contextMenuActions)

    /**
     * Swipe Offset State
     *
     * Tracks the current horizontal translation value (in pixels) of the top card layer.
     */
    const [offset, setOffset] = useState(0);

    /**
     * Dragging Interaction State
     *
     * Tracks whether the user is actively holding and dragging the element to temporarily disable smooth CSS transitions.
     */
    const [isDragging, setIsDragging] = useState(false);

    /**
     * Initial Touch X-Coordinate Ref
     *
     * Stores the starting horizontal position of the user's finger upon touching the screen.
     */
    const startX = useRef(0);

    /**
     * Initial Touch Offset Ref
     *
     * Stores the existing translation offset at the exact moment the drag interaction begins.
     */
    const startOffset = useRef(0);

    /**
     * Touch Start Handler
     *
     * Initializes the drag sequence by recording the starting coordinates and toggling the dragging state.
     *
     * @param {TouchEvent} e - The native touch event.
     * @returns {void}
     */
    const handleTouchStart = (e) => {
        startX.current = e.touches[0].clientX;
        startOffset.current = offset;
        setIsDragging(true);
    };

    /**
     * Touch Move Handler
     *
     * Calculates the delta movement from the start point and applies it to the offset state,
     * clamping the maximum allowed visual drag distance.
     *
     * @param {TouchEvent} e - The native touch event.
     * @returns {void}
     */
    const handleTouchMove = (e) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startX.current;
        let newOffset = startOffset.current + deltaX;

        if (newOffset > LEFT_ACTIONS_WIDTH + 20) newOffset = LEFT_ACTIONS_WIDTH + 20;
        if (newOffset < RIGHT_ACTIONS_WIDTH - 20) newOffset = RIGHT_ACTIONS_WIDTH - 20;

        setOffset(newOffset);
    };

    /**
     * Touch End Snap Handler
     *
     * Terminates the drag sequence and evaluates the final offset against predefined thresholds.
     * If crossed, it snaps the layer open to reveal actions; otherwise, it snaps back to neutral.
     *
     * @returns {void}
     */
    const handleTouchEnd = () => {
        setIsDragging(false);

        if (offset > LEFT_ACTIONS_WIDTH / 2) {
            setOffset(LEFT_ACTIONS_WIDTH);
        } else if (offset < RIGHT_ACTIONS_WIDTH / 2) {
            setOffset(RIGHT_ACTIONS_WIDTH);
        } else {
            setOffset(0);
        }
    };

    /**
     * Context Action Click Handler
     *
     * Intercepts clicks on the revealed action buttons, snaps the wrapper shut, silently injects
     * the target entity into the context state, and fires the corresponding parent action modal.
     *
     * @param {MouseEvent} e - The native click event.
     * @param {string} actionType - String identifier ('edit', 'rename', 'delete') mapping to the requested action.
     * @returns {void}
     */
    const handleActionClick = (e, actionType) => {
        e.stopPropagation();
        setOffset(0);

        if (actionType === "edit") {
            contextMenuActions.handleActionEdit(entity);
        } else if (actionType === "rename") {
            contextMenuActions.handleActionRename(entity);
        } else if (actionType === "delete") {
            contextMenuActions.handleActionDelete(entity);
        }
    };

    // --- 2. Render ---

    return (
        /* Master Swipeable Container */
        <div className={`relative w-full rounded-[2rem] touch-pan-y shrink-0 ${offset !== 0 ? "overflow-hidden" : ""}`}>
            {/* Background Layer: Revealed Action Buttons */}
            <div
                className={`absolute inset-0 flex justify-between items-center w-full h-full bg-primary-300 transition-opacity duration-75 ${
                    offset === 0 ? "opacity-0" : "opacity-100"
                }`}
            >
                {/* Left Side Action Block: Edit */}
                <div
                    className="flex items-center justify-start h-full pl-5 w-1/2 bg-primary-300 text-primary cursor-pointer"
                    onClick={(e) => handleActionClick(e, "edit")}
                >
                    <IconEdit className="w-6 h-6" />
                </div>

                {/* Right Side Actions Block: Rename and Delete */}
                <div className="flex items-center justify-end w-1/2 h-full">
                    {/* Inner Action: Rename */}
                    <div
                        className="flex items-center justify-center h-full pl-4 pr-5 bg-primary-300 text-primary cursor-pointer"
                        onClick={(e) => handleActionClick(e, "rename")}
                    >
                        <IconWriting className="w-6 h-6" />
                    </div>

                    {/* Inner Action: Delete */}
                    <div
                        className="flex items-center justify-center h-full pl-4 pr-5 bg-tertiary-200 text-primary cursor-pointer"
                        onClick={(e) => handleActionClick(e, "delete")}
                    >
                        <IconTrash className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Foreground Layer: Content Card (The Draggable Surface) */}
            <div
                className={`relative w-full h-full bg-primary rounded-[2rem] ${offset !== 0 ? "shadow-[-4px_0_15px_rgba(0,0,0,0.08)]" : ""} ${!isDragging ? "transition-transform duration-300 ease-out" : ""}`}
                style={{ transform: `translateX(${offset}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Render Injected Entity Card Contents */}
                {children}
            </div>
        </div>
    );
};

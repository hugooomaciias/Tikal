/** Assets, Utils & Constants */
import { PHASE_COLOURS } from "../constants/phase_colours.js";

/**
 * Generate Time Options Helper
 *
 * Creates an array of time strings in 'HH:MM' format, spaced by 15-minute intervals,
 * spanning a full 24-hour period. Used for time picker dropdowns.
 *
 * @returns {Array<string>} An array of formatted time strings.
 */
const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = h.toString().padStart(2, "0");
            const min = m.toString().padStart(2, "0");
            times.push(`${hour}:${min}`);
        }
    }
    return times;
};

/**
 * Pre-computed Time Segment Options
 *
 * A static constant storing the generated 15-minute interval time options
 * to avoid recalculation on subsequent component renders.
 */
export const TIME_OPTIONS = generateTimeOptions();

/**
 * Color Object Resolver Helper
 *
 * Resolves a raw color input (which can be a string ID, a HEX code, an existing color object,
 * or null/undefined) into a valid standardized color object from the PHASE_COLOURS palette.
 * Falls back to the primary theme color if no match is found.
 *
 * @param {string|Object|null} rawColor - The input color representation to resolve.
 * @returns {Object} The matched color object containing 'id', 'hex', and theme metadata.
 */
export const resolveColorObject = (rawColor) => {
    if (!rawColor) return PHASE_COLOURS[0];
    const target = typeof rawColor === "object" ? (rawColor.id || rawColor.hex || "") : String(rawColor);
    const clean = target.trim().toLowerCase();
    return PHASE_COLOURS.find((c) => 
        c.id.toLowerCase() === clean || 
        c.hex.toLowerCase() === clean
    ) || PHASE_COLOURS[0];
};

/**
 * Safe Date Parsing Helper
 *
 * Defensively parses any incoming date value (string, timestamp, or Date object)
 * into a valid JavaScript Date instance. Falls back to the current date and time
 * if the input is null, undefined, or evaluates to an invalid timestamp (`NaN`).
 *
 * @param {string|number|Date} dateVal - The raw date representation to parse.
 * @returns {Date} A valid JavaScript Date object.
 */
export const safeParseDate = (dateVal) => {
    if (!dateVal) return new Date();
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? new Date() : d;
};

/**
 * Format DateTime to ISO Helper
 *
 * Combines a raw date string (YYYY-MM-DD or ISO) and a time string (HH:MM)
 * into a valid ISO 8601 UTC datetime string required by the backend DTO.
 *
 * @param {string|Date} dateObj - The date string or object from the form state.
 * @param {string} timeStr - The time string (e.g., "14:30") from the form state.
 * @returns {string} The formatted ISO 8601 datetime string.
 */
export const formatDateTimeISO = (dateObj, timeStr) => {
    const safeDate = safeParseDate(dateObj);
    
    const year = safeDate.getFullYear();
    const month = String(safeDate.getMonth() + 1).padStart(2, "0");
    const day = String(safeDate.getDate()).padStart(2, "0");

    const [hours, minutes] = (timeStr || "10:00").split(":");
    
    const combinedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
    
    return isNaN(combinedDate.getTime()) ? new Date().toISOString() : combinedDate.toISOString();
};

/**
 * Resolve Hierarchical Link Payload Helper
 *
 * Translates the UI-specific cascading selection state ('p_1', 'f_5', 't_99') into
 * the precise relational integer IDs and event type classification expected by the
 * backend DTO. Enforces mutual exclusion: exactly one ID is populated as a number,
 * while the other two remain null.
 *
 * @param {string} type - The form tab type ('linked' or 'general').
 * @param {string} linkId - The raw prefixed ID from the cascading selector (e.g., "f_23").
 * @returns {Object} The resolved DTO partial: { eventType, projectId, stageId, taskId }.
 */
export const resolveLinkPayload = (type, linkId) => {
    if (!linkId) {
        return {
            eventType: "GENERAL",
            projectId: null,
            stageId: null,
            taskId: null,
        };
    }

    const numericId = parseInt(linkId.replace(/^[pft]_/, ""), 10);
    if (isNaN(numericId)) {
        return { eventType: "GENERAL", projectId: null, stageId: null, taskId: null };
    }
    if (linkId.startsWith("p_")) {
        return { eventType: "WORK_SESSION", projectId: numericId, stageId: null, taskId: null };
    }
    if (linkId.startsWith("f_")) {
        return { eventType: "WORK_SESSION", projectId: null, stageId: numericId, taskId: null };
    }
    if (linkId.startsWith("t_")) {
        return { eventType: "WORK_SESSION", projectId: null, stageId: null, taskId: numericId };
    }

    return { eventType: "GENERAL", projectId: null, stageId: null, taskId: null };
};

/**
 * Extract DTO IDs from Linked Entity Helper
 *
 * Takes whatever format the frontend holds for a linked entity (a raw string like "p_8"
 * or a complex object like { id: "p_8", name: "Project" }) and converts it directly into
 * the relational integer payload expected by the backend DTO.
 *
 * @param {string|Object|null} linkedEntity - The frontend entity representation ("p_8" or { id: "p_8" }).
 * @returns {Object} The resolved DTO partial: { eventType, projectId, stageId, taskId }.
 */
export const extractDtoFromLinkedEntity = (linkedEntity) => {
    if (!linkedEntity) {
        return {
            eventType: "GENERAL",
            projectId: null,
            stageId: null,
            taskId: null,
        };
    }

    const targetId = typeof linkedEntity === "object" ? (linkedEntity.id || "") : String(linkedEntity);

    return resolveLinkPayload("linked", targetId);
};

/**
 * Generate Cascading Options
 *
 * Transmuta un array jerárquico de proyectos, fases y tareas en un array plano
 * estandarizado con prefijos de ID (p_, f_, t_) y punteros relacionales,
 * listo para ser consumido por componentes como CascadingLinkSelect.
 *
 * @param {Array} tasksData - Array crudo de proyectos proveniente del backend/contexto.
 * @returns {Array} Array plano formateado para el selector en cascada.
 */
export const generateCascadingOptions = (tasksData = []) => {
    if (!tasksData || tasksData.length === 0) return [];

    const options = [];

    tasksData.forEach((project) => {
        options.push({
            id: `p_${project.id}`,
            type: "project",
            name: project.name,
            logo: project.logo,
        });

        if (project.stages && project.stages.length > 0) {
            project.stages.forEach((stage) => {
                options.push({
                    id: `f_${stage.id}`,
                    type: "phase",
                    name: stage.name,
                    color: stage.colour,
                    projectId: `p_${project.id}`,
                });

                if (stage.tasks && stage.tasks.length > 0) {
                    stage.tasks.forEach((task) => {
                        options.push({
                            id: `t_${task.id}`,
                            type: "task",
                            name: task.name,
                            phaseId: `f_${stage.id}`,
                            color: task.colour,
                            logo: task.logo
                        });
                    });
                }
            });
        }
    });

    return options;
};
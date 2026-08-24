/**
 * Format Time Segments
 *
 * Converts a raw integer of total accumulated seconds into a strictly formatted,
 * human-readable object containing zero-padded hours, minutes, and seconds.
 *
 * @param {number} totalSeconds - The total accumulated time in seconds.
 * @returns {{ hours: string, minutes: string, seconds: string }} An object with padded string values.
 */
export const formatTimeSegments = (totalSeconds) => {
    if (typeof totalSeconds !== "number" || isNaN(totalSeconds)) {
        return { hours: "00", minutes: "00", seconds: "00" };
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const pad = (num) => String(num).padStart(2, "0");

    return { 
        hours: pad(h), 
        minutes: pad(m), 
        seconds: pad(s) 
    };
};
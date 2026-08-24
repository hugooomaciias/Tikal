/**
 * Rank CSS Classes Dictionary (Tailwind Safelist)
 *
 * This constant maps user rank levels to their corresponding dynamic CSS classes.
 * Exporting this explicitly prevents Tailwind's PurgeCSS from removing the dynamic 
 * classes during compilation, ensuring global theme variables always resolve correctly.
 */
export const RANK_CLASSES = {
    1: "theme-rank-1",
    2: "theme-rank-2",
    3: "theme-rank-3",
    4: "theme-rank-4",
};
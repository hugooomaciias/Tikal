import tailwindConfig from "../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

/**
 * Predefined Phase Colors Structure
 *
 * This constant array provides a curated, fixed palette of colors available
 * for selection when creating or editing a Phase (Stage) or Sublist within
 * the application. It acts as the single source of truth for color definitions.
 *
 * The colors are logically grouped by hue and provide a standard ID,
 * the hexadecimal UI value, and a human-readable descriptive name.
 *
 * @constant
 * @type {Array<{id: string, hex: string, name: string}>}
 */
export const PHASE_COLOURS = [
    // Greens
    { id: "g1", hex: "#BDDDC7", light: "#f1f8f3", text: colors.quaternary[700] },
    { id: "g2", hex: "#91C4A5", light: "#f1f8f3", text: colors.quaternary[50] },
    { id: "g3", hex: "#C1E1C1", light: "#f4f9f4", text: colors.quaternary[700] },
    { id: "g4", hex: "#D0E8D7", light: "#f4f9f5", text: colors.quaternary[700] },
    { id: "g5", hex: "#A2C9A0", light: "#f5f9f4", text: colors.quaternary[50] },
    { id: "g6", hex: "#C2C1AF", light: "#f9fbf8", text: colors.quaternary[700] },

    // Blues
    { id: "b1", hex: "#B2EAEF", light: "#effcfc", text: colors.quaternary[700] },
    { id: "b2", hex: "#7DDAE3", light: "#effcfc", text: colors.quaternary[50] },
    { id: "b3", hex: "#3f6c7b", light: "#deedef", text: colors.quaternary[50] },
    { id: "b4", hex: "#C6E2E9", light: "#f4f9fb", text: colors.quaternary[700] },
    { id: "b5", hex: "#B4D8E7", light: "#f3f9fc", text: colors.quaternary[700] },
    { id: "b6", hex: "#99C1DE", light: "#f3f7fb", text: colors.quaternary[50] },

    // Yellows
    { id: "y1", hex: "#ECD79C", light: "#fcf8ee", text: colors.quaternary[700] },
    { id: "y2", hex: "#E1BA63", light: "#fbf7eb", text: colors.quaternary[700] },
    { id: "y3", hex: "#FDFD96", light: "#fefee8", text: colors.quaternary[700] },
    { id: "y4", hex: "#F6E3B4", light: "#fdf8ed", text: colors.quaternary[700] },
    { id: "y5", hex: "#DAD9CE", light: "#f9fbf8", text: colors.quaternary[700] },
    { id: "y6", hex: "#FADCA5", light: "#fef9ee", text: colors.quaternary[700] },

    // Oranges
    { id: "o1", hex: "#F8CD9C", light: "#fef7ee", text: colors.quaternary[700] },
    { id: "o2", hex: "#F4B886", light: "#fef6ee", text: colors.quaternary[700] },
    { id: "o3", hex: "#F6C8A6", light: "#fef5ee", text: colors.quaternary[700] },
    { id: "o4", hex: "#F5B7B1", light: "#fdf4f3", text: colors.quaternary[700] },
    { id: "o5", hex: "#FFDAB9", light: "#fff6ed", text: colors.quaternary[700] },
    { id: "o6", hex: "#E2A788", light: "#fcf5f0", text: colors.quaternary[50] },

    // Pinks
    { id: "p1", hex: "#FADADD", light: "#fdf3f4", text: colors.quaternary[700] },
    { id: "p2", hex: "#E8B2C1", light: "#fcf4f6", text: colors.quaternary[700] },
    { id: "p3", hex: "#F2C6DE", light: "#fcf3f8", text: colors.quaternary[700] },
    { id: "p4", hex: "#D7BDE2", light: "#fbf8fc", text: colors.quaternary[700] },
    { id: "p5", hex: "#C3B1E1", light: "#f8f6fc", text: colors.quaternary[50] },
    { id: "p6", hex: "#E2D6F5", light: "#f8f5fd", text: colors.quaternary[700] },
];

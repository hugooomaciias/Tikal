/** React & Third-Party Libraries */
import resolveConfig from "tailwindcss/resolveConfig";

/** Assets, Utils & Constants */
import tailwindConfig from "../../tailwind.config";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
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
 * @type {Array<{id: string, hex: string, light: string, text: string}>}
 */
export const PHASE_COLOURS = [
    // Greens
    { id: "g1", hex: "#BDDDC7", light: "#F1F8F3", text: colors.quaternary[700] },
    { id: "g2", hex: "#91C4A5", light: "#F1F8F3", text: colors.quaternary[50] },
    { id: "g3", hex: "#C1E1C1", light: "#F4F9F4", text: colors.quaternary[700] },
    { id: "g4", hex: "#D0E8D7", light: "#F4F9F5", text: colors.quaternary[700] },
    { id: "g5", hex: "#A2C9A0", light: "#F5F9F4", text: colors.quaternary[50] },
    { id: "g6", hex: "#C2C1AF", light: "#F9FBF8", text: colors.quaternary[700] },

    // Blues
    { id: "b1", hex: "#B2EAEF", light: "#EFFCFC", text: colors.quaternary[700] },
    { id: "b2", hex: "#7DDAE3", light: "#EFFCFC", text: colors.quaternary[50] },
    { id: "b3", hex: "#3F6C7B", light: "#DEEDEF", text: colors.quaternary[50] },
    { id: "b4", hex: "#C6E2E9", light: "#F4F9FB", text: colors.quaternary[700] },
    { id: "b5", hex: "#B4D8E7", light: "#F3F9FC", text: colors.quaternary[700] },
    { id: "b6", hex: "#99C1DE", light: "#F3F7FB", text: colors.quaternary[50] },

    // Yellows
    { id: "y1", hex: "#ECD79C", light: "#FCF8EE", text: colors.quaternary[700] },
    { id: "y2", hex: "#E1BA63", light: "#FBF7EB", text: colors.quaternary[700] },
    { id: "y3", hex: "#FDFD96", light: "#FEFEE8", text: colors.quaternary[700] },
    { id: "y4", hex: "#F6E3B4", light: "#FDF8ED", text: colors.quaternary[700] },
    { id: "y5", hex: "#DAD9CE", light: "#F9FBF8", text: colors.quaternary[700] },
    { id: "y6", hex: "#FADCA5", light: "#FEF9EE", text: colors.quaternary[700] },

    // Oranges
    { id: "o1", hex: "#F8CD9C", light: "#FEF7EE", text: colors.quaternary[700] },
    { id: "o2", hex: "#F4B886", light: "#FEF6EE", text: colors.quaternary[700] },
    { id: "o3", hex: "#F6C8A6", light: "#FEF5EE", text: colors.quaternary[700] },
    { id: "o4", hex: "#F5B7B1", light: "#FDF4F3", text: colors.quaternary[700] },
    { id: "o5", hex: "#FFDAB9", light: "#FFF6ED", text: colors.quaternary[700] },
    { id: "o6", hex: "#E2A788", light: "#FCF5F0", text: colors.quaternary[50] },

    // Pinks
    { id: "p1", hex: "#FADADD", light: "#FDF3F4", text: colors.quaternary[700] },
    { id: "p2", hex: "#E8B2C1", light: "#FCF4F6", text: colors.quaternary[700] },
    { id: "p3", hex: "#F2C6DE", light: "#FCF3F8", text: colors.quaternary[700] },
    { id: "p4", hex: "#D7BDE2", light: "#FBF8FC", text: colors.quaternary[700] },
    { id: "p5", hex: "#C3B1E1", light: "#F8F6FC", text: colors.quaternary[50] },
    { id: "p6", hex: "#E2D6F5", light: "#F8F5FD", text: colors.quaternary[700] },
];

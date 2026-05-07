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
    { id: "g1", hex: "#BDDDC7", light: "#F1F8F3", alt: "#418860", text: colors.quaternary[700] },
    { id: "g2", hex: "#91C4A5", light: "#F1F8F3", alt: "#2F6C4C", text: colors.quaternary[50] },
    { id: "g3", hex: "#C1E1C1", light: "#F4F9F4", alt: "#509751", text: colors.quaternary[700] },
    { id: "g4", hex: "#D0E8D7", light: "#F4F9F5", alt: "#89BF98", text: colors.quaternary[700] },
    { id: "g5", hex: "#A2C9A0", light: "#F5F9F4", alt: "#457643", text: colors.quaternary[50] },
    { id: "g6", hex: "#C2C1AF", light: "#F9FBF8", alt: "#494A36", text: colors.quaternary[700] },

    // Blues
    { id: "b1", hex: "#B2EAEF", light: "#EFFCFC", alt: "#25A3B5", text: colors.quaternary[600] },
    { id: "b2", hex: "#7DDAE3", light: "#EFFCFC", alt: "#228498", text: colors.quaternary[50] },
    { id: "b3", hex: "#3F6C7B", light: "#DEEDEF", alt: "#96C1CA", text: colors.quaternary[50] },
    { id: "b4", hex: "#C6E2E9", light: "#F4F9FB", alt: "#489EAF", text: colors.quaternary[700] },
    { id: "b5", hex: "#B4D8E7", light: "#F3F9FC", alt: "#4098B7", text: colors.quaternary[700] },
    { id: "b6", hex: "#99C1DE", light: "#F3F7FB", alt: "#5380BD", text: colors.quaternary[50] },

    // Yellows
    { id: "y1", hex: "#ECD79C", light: "#FCF8EE", alt: "#D28B2E", text: colors.quaternary[600] },
    { id: "y2", hex: "#E1BA63", light: "#FBF7EB", alt: "#AC6B22", text: colors.quaternary[600] },
    { id: "y3", hex: "#F7EB1B", light: "#FEFEE8", alt: "#987C08", text: colors.quaternary[700] },
    { id: "y4", hex: "#F2D795", light: "#FDF8ED", alt: "#DF8821", text: colors.quaternary[700] },
    { id: "y5", hex: "#DAD9CE", light: "#F9FBF8", alt: "#5B5D48", text: colors.quaternary[700] },
    { id: "y6", hex: "#F7C87A", light: "#FEF9EE", alt: "#E17215", text: colors.quaternary[700] },

    // Oranges
    { id: "o1", hex: "#F8CD9C", light: "#FEF7EE", alt: "#EC7523", text: colors.quaternary[700] },
    { id: "o2", hex: "#F4B886", light: "#FEF6EE", alt: "#DA521C", text: colors.quaternary[700] },
    { id: "o3", hex: "#F6C8A6", light: "#FEF5EE", alt: "#E66229", text: colors.quaternary[700] },
    { id: "o4", hex: "#F5B7B1", light: "#FDF4F3", alt: "#CC4336", text: colors.quaternary[700] },
    { id: "o5", hex: "#FFB172", light: "#FFF6ED", alt: "#ED4809", text: colors.quaternary[700] },
    { id: "o6", hex: "#E2A788", light: "#FCF5F0", alt: "#C04E36", text: colors.quaternary[50] },

    // Pinks
    { id: "p1", hex: "#f3aeb4", light: "#FDF3F4", alt: "#c93947", text: colors.quaternary[700] },
    { id: "p2", hex: "#E8B2C1", light: "#FCF4F6", alt: "#b64871", text: colors.quaternary[700] },
    { id: "p3", hex: "#F2C6DE", light: "#FCF3F8", alt: "#d75d96", text: colors.quaternary[700] },
    { id: "p4", hex: "#D7BDE2", light: "#FBF8FC", alt: "#a06ab3", text: colors.quaternary[700] },
    { id: "p5", hex: "#C3B1E1", light: "#F8F6FC", alt: "#8256ab", text: colors.quaternary[50] },
    { id: "p6", hex: "#d5c2f0", light: "#F8F5FD", alt: "#9d5acd", text: colors.quaternary[700] },
];

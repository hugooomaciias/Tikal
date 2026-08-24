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
    { id: "g1", hex: "#91C4A5", alt: "#2F6C4C", text: colors.quaternary[50], light: "#F1F8F3", minRank: 1 },
    { id: "g2", hex: "#A2C9A0", alt: "#457643", text: colors.quaternary[50], light: "#F5F9F4", minRank: 1 },
    { id: "g3", hex: "#C1E1C1", alt: "#509751", text: colors.quaternary[700], light: "#F4F9F4", minRank: 1 },
    { id: "g4", hex: "#BDDDC7", alt: "#418860", text: colors.quaternary[700], light: "#F1F8F3", minRank: 1 },
    { id: "g5", hex: "#D0E8D7", alt: "#89BF98", text: colors.quaternary[700], light: "#F4F9F5", minRank: 1 },
    { id: "g6", hex: "#C2C1AF", alt: "#494A36", text: colors.quaternary[700], light: "#F9FBF8", minRank: 1 },

    // Pinks
    { id: "p1", hex: "#C47284", alt: "#79384D", text: colors.quaternary[50], light: "#FDF3F4", minRank: 1 },
    { id: "p2", hex: "#FF69EB", alt: "#B61599", text: colors.quaternary.DEFAULT, light: "#F8F6FC", minRank: 1 },
    { id: "p3", hex: "#FF9EBB", alt: "#E5196A", text: colors.quaternary[700], light: "#F8F5FD", minRank: 1 },
    { id: "p4", hex: "#E8B2C1", alt: "#B64871", text: colors.quaternary[700], light: "#FCF4F6", minRank: 1 },
    { id: "p5", hex: "#FDC5F5", alt: "#ED48CB", text: colors.quaternary[500], light: "#FBF8FC", minRank: 1 },
    { id: "p6", hex: "#F2C6DE", alt: "#D75D96", text: colors.quaternary[700], light: "#FCF3F8", minRank: 1 },

    // Violets
    { id: "v1", hex: "#4B0082", alt: "#8215DB", text: colors.quaternary[50], light: "#FDF3F4", minRank: 1 },
    { id: "v2", hex: "#6A5ACD", alt: "#B2B7EF", text: colors.quaternary[50], light: "#F8F5FD", minRank: 1 },
    { id: "v3", hex: "#9D7EA4", alt: "#5A465D", text: colors.quaternary[50], light: "#FCF4F6", minRank: 1 },
    { id: "v4", hex: "#C3B1E1", alt: "#8256AB", text: colors.quaternary.DEFAULT, light: "#F8F6FC", minRank: 1 },
    { id: "v5", hex: "#D5C2F0", alt: "#8956C7", text: colors.quaternary[700], light: "#FCF3F8", minRank: 1 },
    { id: "v6", hex: "#D7BDE2", alt: "#A06AB3", text: colors.quaternary[500], light: "#FBF8FC", minRank: 1 },

    // Oranges
    { id: "o1", hex: "#E2A788", alt: "#C04E36", text: colors.quaternary[50], light: "#FCF5F0", minRank: 1 },
    { id: "o2", hex: "#FFB172", alt: "#ED4809", text: colors.quaternary[700], light: "#FFF6ED", minRank: 1 },
    { id: "o3", hex: "#F4B886", alt: "#DA521C", text: colors.quaternary[700], light: "#FEF6EE", minRank: 1 },
    { id: "o4", hex: "#F5B7B1", alt: "#CC4336", text: colors.quaternary[700], light: "#FDF4F3", minRank: 1 },
    { id: "o5", hex: "#F6C8A6", alt: "#E66229", text: colors.quaternary[700], light: "#FEF5EE", minRank: 1 },
    { id: "o6", hex: "#F8CD9C", alt: "#EC7523", text: colors.quaternary[700], light: "#FEF7EE", minRank: 1 },

    // Blues
    { id: "b1", hex: "#3F6C7B", alt: "#96C1CA", text: colors.quaternary[50], light: "#DEEDEF", minRank: 2 },
    { id: "b2", hex: "#99C1DE", alt: "#5380BD", text: colors.quaternary[50], light: "#F3F7FB", minRank: 2 },
    { id: "b3", hex: "#7DDAE3", alt: "#228498", text: colors.quaternary[50], light: "#EFFCFC", minRank: 2 },
    { id: "b4", hex: "#B4D8E7", alt: "#4098B7", text: colors.quaternary[700], light: "#F3F9FC", minRank: 2 },
    { id: "b5", hex: "#B2EAEF", alt: "#25A3B5", text: colors.quaternary[600], light: "#EFFCFC", minRank: 2 },
    { id: "b6", hex: "#C6E2E9", alt: "#489EAF", text: colors.quaternary[700], light: "#F4F9FB", minRank: 2 },

    // Reds
    { id: "r1", hex: "#6A040F", alt: "#CC091E", text: colors.quaternary[50], light: "#DEEDEF", minRank: 3 },
    { id: "r2", hex: "#990033", alt: "#FF003E", text: colors.quaternary[50], light: "#EFFCFC", minRank: 3 },
    { id: "r3", hex: "#D00000", alt: "#FF5959", text: colors.quaternary[50], light: "#F3F7FB", minRank: 3 },
    { id: "r4", hex: "#CC444B", alt: "#79222E", text: colors.quaternary[50], light: "#F3F9FC", minRank: 3 },
    { id: "r5", hex: "#F87575", alt: "#B91C1C", text: colors.quaternary.DEFAULT, light: "#F4F9FB", minRank: 3 },
    { id: "r6", hex: "#F29479", alt: "#B24323", text: colors.quaternary[700], light: "#EFFCFC", minRank: 3 },

    // Yellows
    { id: "y1", hex: "#F7EB1B", alt: "#987C08", text: colors.quaternary[700], light: "#FEFEE8", minRank: 4 },
    { id: "y2", hex: "#FFC300", alt: "#985208", text: colors.quaternary[700], light: "#F9FBF8", minRank: 4 },
    { id: "y3", hex: "#E1BA63", alt: "#AC6B22", text: colors.quaternary[600], light: "#FBF7EB", minRank: 4 },
    { id: "y4", hex: "#F7C87A", alt: "#E17215", text: colors.quaternary[700], light: "#FEF9EE", minRank: 4 },
    { id: "y5", hex: "#F2D795", alt: "#DF8821", text: colors.quaternary[700], light: "#FDF8ED", minRank: 4 },
    { id: "y6", hex: "#FCEFB4", alt: "#F5B41A", text: colors.quaternary[600], light: "#FCF8EE", minRank: 4 },
];

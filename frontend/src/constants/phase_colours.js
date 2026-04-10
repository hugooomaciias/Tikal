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
    // Greens & Mints
    { id: "pri-100", name: "Menta Claro", hex: "#BDDDC7", light: "#f1f8f3" },
    { id: "pri-200", name: "Verde Salvia", hex: "#91C4A5", light: "#f1f8f3" },
    { id: "green-tea", name: "Té Verde", hex: "#C1E1C1", light: "#f4f9f4" },
    { id: "green-frost", name: "Escarcha", hex: "#D0E8D7", light: "#f4f9f5" },
    { id: "green-pastel", name: "Verde Pastel", hex: "#A2C9A0", light: "#f5f9f4" },
    { id: "olive-light", name: "Oliva Suave", hex: "#C2C1AF", light: "#f9fbf8" },

    // Blues & Cyans
    { id: "sec-100", name: "Cían Claro", hex: "#B2EAEF", light: "#effcfc" },
    { id: "sec-200", name: "Agua", hex: "#7DDAE3", light: "#effcfc" },
    { id: "blue-powder", name: "Azul Polvo", hex: "#354d57", light: "#f5f8fa" },
    { id: "blue-baby", name: "Azul Bebé", hex: "#C6E2E9", light: "#f4f9fb" },
    { id: "blue-sky", name: "Azul Cielo", hex: "#B4D8E7", light: "#f3f9fc" },
    { id: "blue-serenity", name: "Serenidad", hex: "#99C1DE", light: "#f3f7fb" },

    // Yellows & Sands
    { id: "ter-100", name: "Oro Pálido", hex: "#ECD79C", light: "#fcf8ee" },
    { id: "ter-200", name: "Mostaza Suave", hex: "#E1BA63", light: "#fbf7eb" },
    { id: "yellow-pastel", name: "Amarillo Pastel", hex: "#FDFD96", light: "#fefee8" },
    { id: "yellow-butter", name: "Mantequilla", hex: "#F6E3B4", light: "#fdf8ed" },
    { id: "sand", name: "Arena", hex: "#DAD9CE", light: "#f9fbf8" },
    { id: "orange-pastel", name: "Naranja Pastel", hex: "#FADCA5", light: "#fef9ee" },

    // Peaches & Corals
    { id: "peach", name: "Melocotón", hex: "#F8CD9C", light: "#fef7ee" },
    { id: "apricot", name: "Albaricoque", hex: "#F4B886", light: "#fef6ee" },
    { id: "melon", name: "Melón", hex: "#F6C8A6", light: "#fef5ee" },
    { id: "coral-light", name: "Coral Suave", hex: "#F5B7B1", light: "#fdf4f3" },
    { id: "salmon-pale", name: "Salmón Pálido", hex: "#FFDAB9", light: "#fff6ed" },
    { id: "terracotta", name: "Terracota Pastel", hex: "#E2A788", light: "#fcf5f0" },

    // Pinks & Lilacs
    { id: "pink-pastel", name: "Rosa Pálido", hex: "#FADADD", light: "#fdf3f4" },
    { id: "pink-blush", name: "Rubor", hex: "#E8B2C1", light: "#fcf4f6" },
    { id: "pink-rose", name: "Rosa Empolvado", hex: "#F2C6DE", light: "#fcf3f8" },
    { id: "purple-thistle", name: "Cardo", hex: "#D7BDE2", light: "#fbf8fc" },
    { id: "purple-lilac", name: "Lila", hex: "#C3B1E1", light: "#f8f6fc" },
    { id: "purple-lavender", name: "Lavanda", hex: "#E2D6F5", light: "#f8f5fd" },
];

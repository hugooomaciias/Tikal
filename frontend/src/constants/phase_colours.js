/**
 * Predefined Phase Colors
 *
 * This constant array provides a curated palette of colors available for selection
 * when creating or editing a Phase (Stage) or Sublist. It groups colors by hue
 * and provides a simple string ID, hexadecimal value, and descriptive name.
 *
 * @type {Array<{id: string, hex: string, name: string}>}
 */
export const PHASE_COLOURS = [
    // Greens & Mints
    { id: "pri-100", hex: "#BDDDC7", name: "Menta Claro" },         // primary-100
    { id: "pri-200", hex: "#91C4A5", name: "Verde Salvia" },        // primary-200
    { id: "green-tea", hex: "#C1E1C1", name: "Té Verde" },
    { id: "green-frost", hex: "#D0E8D7", name: "Escarcha" },
    { id: "green-pastel", hex: "#A2C9A0", name: "Verde Pastel" },
    { id: "olive-light", hex: "#C2C1AF", name: "Oliva Suave" },     // quinary-200

    // Blues & Cyans
    { id: "sec-100", hex: "#B2EAEF", name: "Cían Claro" },          // secondary-100
    { id: "sec-200", hex: "#7DDAE3", name: "Agua" },                // secondary-200
    { id: "blue-powder", hex: "#AEC6CF", name: "Azul Polvo" },
    { id: "blue-baby", hex: "#C6E2E9", name: "Azul Bebé" },
    { id: "blue-sky", hex: "#B4D8E7", name: "Azul Cielo" },
    { id: "blue-serenity", hex: "#99C1DE", name: "Serenidad" },

    // Yellows & Sands
    { id: "ter-100", hex: "#ECD79C", name: "Oro Pálido" },          // tertiary-100
    { id: "ter-200", hex: "#E1BA63", name: "Mostaza Suave" },       // tertiary-200
    { id: "yellow-pastel", hex: "#FDFD96", name: "Amarillo Pastel" },
    { id: "yellow-butter", hex: "#F6E3B4", name: "Mantequilla" },
    { id: "sand", hex: "#DAD9CE", name: "Arena" },                  // quinary-100
    { id: "orange-pastel", hex: "#FADCA5", name: "Naranja Pastel" },

    // Peaches & Corals
    { id: "peach", hex: "#F8CD9C", name: "Melocotón" },
    { id: "apricot", hex: "#F4B886", name: "Albaricoque" },
    { id: "melon", hex: "#F6C8A6", name: "Melón" },
    { id: "coral-light", hex: "#F5B7B1", name: "Coral Suave" },
    { id: "salmon-pale", hex: "#FFDAB9", name: "Salmón Pálido" },
    { id: "terracotta", hex: "#E2A788", name: "Terracota Pastel" },

    // Pinks & Lilacs
    { id: "pink-pastel", hex: "#FADADD", name: "Rosa Pálido" },
    { id: "pink-blush", hex: "#E8B2C1", name: "Rubor" },
    { id: "pink-rose", hex: "#F2C6DE", name: "Rosa Empolvado" },
    { id: "purple-thistle", hex: "#D7BDE2", name: "Cardo" },
    { id: "purple-lilac", hex: "#C3B1E1", name: "Lila" },
    { id: "purple-lavender", hex: "#E2D6F5", name: "Lavanda" }
];
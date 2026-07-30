/**
 * Rank Themes Configuration
 *
 * This constant object maps user rank levels (1 through 4) to specific Tailwind CSS utility
 * class configurations. It is used to dynamically style the "Temple Mode" UI components—such
 * as the badge wrapper, progress bars, text colors, and logos—based on the user's current 
 * rank progression.
 *
 * @constant
 * @type {Object.<number, {
 *   wrapper: string,
 *   logo: string,
 *   borderLogo: string,
 *   title: string,
 *   subtitle: string,
 *   track: string,
 *   progress: string,
 *   header: string,
 *   headerIA: string
 * }>}
 */
export const RANK_THEMES = {
    1: {
        wrapper: "bg-primary-900/80 border-primary-700/50",
        logo: "bg-primary-50",
        borderLogo: "border-primary-300",
        title: "text-primary-50",
        subtitle: "text-primary-100/70",
        track: "bg-primary-800",
        progress: "bg-primary-300",
        header: "text-primary-600",
        headerIA: "bg-primary-600",
        widget: {
            track: "bg-primary-50/80",
            borderLogoWidget: "group-hover:border-primary-300"
        }
    },
    2: {
        wrapper: "bg-secondary-900/80 border-secondary-700/50",
        logo: "bg-secondary-50",
        borderLogo: "border-secondary-400",
        title: "text-secondary-50",
        subtitle: "text-secondary-100/70",
        track: "bg-secondary-800",
        progress: "bg-secondary-400",
        header: "text-secondary-700",
        headerIA: "bg-secondary-700",
        widget: {
            track: "bg-secondary-50/80",
            borderLogoWidget: "group-hover:border-secondary-400"
        }
    },
    3: {
        wrapper: "bg-red-950/80 border-red-700/50",
        logo: "bg-red-50",
        borderLogo: "border-red-400",
        title: "text-red-50",
        subtitle: "text-red-100/70",
        track: "bg-red-900",
        progress: "bg-red-400",
        header: "text-red-900",
        headerIA: "bg-red-900",
        widget: {
            track: "bg-red-100/80",
            borderLogoWidget: "group-hover:border-red-400"
        }
    },
    4: {
        wrapper: "bg-tertiary-900/80 border-tertiary-700/50",
        logo: "bg-tertiary-50",
        borderLogo: "border-tertiary-400",
        title: "text-tertiary-50",
        subtitle: "text-tertiary-100/70",
        track: "bg-tertiary-800",
        progress: "bg-tertiary-400",
        header: "text-tertiary-800",
        headerIA: "bg-tertiary-800",
        widget: {
            track: "bg-tertiary-50/80",
            borderLogoWidget: "group-hover:border-tertiary-400"
        }
    },
};
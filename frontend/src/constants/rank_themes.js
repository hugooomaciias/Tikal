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
        background: "bg-primary-900",
        header: "text-primary-600",
        headerIA: "bg-primary-600",
        wrapper: "bg-primary-900/80 border-primary-700/50",
        logo: "bg-primary-50",
        borderLogo: "border-primary-300",
        title: "text-primary-50",
        subtitle: "text-primary-100/70",
        subtitleHover: "hover:text-primary-100",
        track: "bg-primary-800",
        progress: "bg-primary-300",
        progressText: "text-primary-300",
        button: "bg-primary-600 hover:bg-primary-300 hover:text-primary-800",
        widget: {
            track: "bg-primary-50/80",
            borderLogoWidget: "group-hover:border-primary-300"
        },
        input: {
            borderInput: "focus:ring-primary-400",
            placeholder: "text-primary-800",
            labelFocus: "peer-focus:text-primary-400 peer-[:not(:placeholder-shown)]:text-primary-400"
        },
    },
    2: {
        background: "bg-secondary-900",
        header: "text-secondary-700",
        headerIA: "bg-secondary-700",
        wrapper: "bg-secondary-900/80 border-secondary-700/50",
        logo: "bg-secondary-50",
        borderLogo: "border-secondary-400",
        title: "text-secondary-50",
        subtitle: "text-secondary-100/70",
        subtitleHover: "hover:text-secondary-100",
        track: "bg-secondary-800",
        progress: "bg-secondary-400",
        progressText: "text-secondary-400",
        button: "bg-secondary-600 hover:bg-secondary-400 hover:text-secondary-800",
        widget: {
            track: "bg-secondary-50/80",
            borderLogoWidget: "group-hover:border-secondary-400"
        },
        input: {
            borderInput: "focus:ring-secondary-400",
            placeholder: "text-secondary-800",
            labelFocus: "peer-focus:text-secondary-400 peer-[:not(:placeholder-shown)]:text-secondary-400"
        },
        cascading: {
            bg: "bg-secondary-400",
            pill: "bg-secondary-50",
            textActive: "text-secondary-400",
            itemActive: "bg-secondary-800/50",
            itemHover: "hover:bg-secondary-800/20",
            border: "border-secondary-50",
            btnConfirmBg: "bg-secondary-50"
        }
    },
    3: {
        background: "bg-red-950",
        header: "text-red-900",
        headerIA: "bg-red-900",
        wrapper: "bg-red-950/80 border-red-700/50",
        logo: "bg-red-50",
        borderLogo: "border-red-400",
        title: "text-red-50",
        subtitle: "text-red-100/70",
        subtitleHover: "hover:text-red-100",
        track: "bg-red-900",
        progress: "bg-red-400",
        progressText: "text-red-400",
        button: "bg-red-800 hover:bg-red-500 hover:text-red-950",
        widget: {
            track: "bg-red-100/80",
            borderLogoWidget: "group-hover:border-red-400"
        },
        input: {
            borderInput: "focus:ring-red-500",
            placeholder: "text-red-800",
            labelFocus: "peer-focus:text-red-400 peer-[:not(:placeholder-shown)]:text-red-400"
        },
        cascading: {
            bg: "bg-red-500",
            pill: "bg-red-50",
            textActive: "text-red-500",
            itemActive: "bg-red-950/50",
            itemHover: "hover:bg-red-950/20",
            border: "border-red-50",
            btnConfirmBg: "bg-red-50"
        }
    },
    4: {
        background: "bg-tertiary-900",
        header: "text-tertiary-800",
        headerIA: "bg-tertiary-800",
        wrapper: "bg-tertiary-900/80 border-tertiary-700/50",
        logo: "bg-tertiary-50",
        borderLogo: "border-tertiary-400",
        title: "text-tertiary-50",
        subtitle: "text-tertiary-100/70",
        subtitleHover: "hover:text-tertiary-100",
        track: "bg-tertiary-800",
        progress: "bg-tertiary-400",
        progressText: "text-tertiary-400",
        button: "bg-tertiary-600 hover:bg-tertiary-400 hover:text-teartiary-800",
        widget: {
            track: "bg-tertiary-50/80",
            borderLogoWidget: "group-hover:border-tertiary-400"
        },
        input: {
            borderInput: "focus:ring-tertiary-400",
            placeholder: "text-tertiary-800",
            labelFocus: "peer-focus:text-tertiary-400 peer-[:not(:placeholder-shown)]:text-tertiary-400"
        },
        cascading: {
            bg: "bg-tertiary-400",
            pill: "bg-tertiary-50",
            textActive: "text-tertiary-400",
            itemActive: "bg-tertiary-800/50",
            itemHover: "hover:bg-tertiary-800/20",
            border: "border-tertiary-50",
            btnConfirmBg: "bg-tertiary-50"
        }
    },
};
/** React & Third-Party Libraries */
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";

/** Config, Constants & Utils */
import { PROJECTS_ICONS } from "../../../../../../constants/projects_icons.js";
import tailwindConfig from "../../../../../../../tailwind.config.js";
import resolveConfig from "tailwindcss/resolveConfig";

/** Icons */
import { IconBook } from "@tabler/icons-react";

/**
 * Tailwind Configuration Resolver
 *
 * Resolves the Tailwind configuration to extract the defined color palette,
 * ensuring the color constants match the application's global design tokens.
 */
const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

/**
 * Solar Palette Configuration
 *
 * Exact color palette extracted from the design (dark to light),
 * used to dynamically style the pie slices.
 */
const SOLAR_PALETTE = [
    colors.primary[800], // Verde muy oscuro
    colors.primary[600], // Verde medio
    colors.primary[400], // Verde claro
    colors.primary[200], // Verde muy claro
    colors.primary[50], // Por si hay más de 4 elementos
];

/**
 * Get Icon Component Helper
 *
 * Maps a string identifier to its corresponding React Icon component from the registry.
 *
 * @param {string} iconId - The unique identifier of the icon.
 * @returns {React.ComponentType} The resolved React component or a default fallback.
 */
const getIconComponent = (iconId) => {
    const foundIcon = PROJECTS_ICONS.find((icon) => icon.id === iconId);
    return foundIcon ? foundIcon.component : IconBook;
};

/**
 * Solar Chart Widget Logic Hook
 *
 * Abstracts the local UI state, derived layout calculations, and interaction handlers
 * for the Solar Chart Widget component. This headless hook strictly separates complex
 * data manipulation and event logic from the presentational JSX.
 *
 * @hook
 * @param {Object} params - The configuration object provided to the hook.
 * @param {Object} params.props - External properties injected into the widget (e.g., slices, mostRecurringListName).
 * @returns {Object} The structured payload containing state, derived data, and action handlers for the UI.
 */
export const useSolarChartWidgetLogic = ({ props }) => {
    // --- 1. DOM Refs & Layout State ---

    // (No DOM Refs or Layout State required for this component)

    // --- 2. Local UI State ---

    /**
     * Active Drawer State
     *
     * Tracks which filter drawer ("TIME" or "PROJECTS") is currently open.
     */
    const [activeDrawer, setActiveDrawer] = useState(null);

    /**
     * Hidden Projects State
     *
     * Array of project IDs that are officially hidden and excluded from the pie chart calculation.
     */
    const [hiddenProjects, setHiddenProjects] = useState([]);

    /**
     * Temporary Hidden Projects State
     *
     * Array of project IDs hidden while interacting with the projects filter drawer,
     * before the user commits the changes.
     */
    const [tempHiddenProjects, setTempHiddenProjects] = useState([]);

    /**
     * Time Mode State
     *
     * Determines the current time aggregation mode for the chart (e.g., "GLOBAL", "DAILY", "WEEKLY").
     */
    const [timeMode, setTimeMode] = useState("GLOBAL");

    /**
     * Time Offset State
     *
     * Tracks the numerical offset (e.g., days or weeks ago) from the current date when
     * navigating through specific time modes.
     */
    const [timeOffset, setTimeOffset] = useState(0);

    // --- 3. Derived UI Data ---

    /**
     * Translation Hook
     *
     * Provides access to the i18n instance specifically scoped to the "app_statistics"
     * namespace to localize widget text content dynamically.
     */
    const { t } = useTranslation("app_statistics");

    /**
     * Slices Data
     *
     * Safely extracts the array of chart slices from props.
     * Memoized to prevent generating a new array reference during re-renders if props have not changed.
     */
    const slices = useMemo(() => props?.slices || [], [props?.slices]);

    /**
     * Sorted Slices
     *
     * Sorts the data slices in descending order based on the minutes dedicated.
     * Memoized to prevent costly sorting operations on every render cycle.
     */
    const sortedSlices = useMemo(() => {
        return [...slices].sort((a, b) => b.percentage - a.percentage);
    }, [slices]);

    /**
     * Most Recurring Name
     *
     * Safely extracts the most recurring list name, providing a fallback string.
     * Memoized to maintain a stable reference across renders.
     */
    const mostRecurringName = useMemo(
        () => props?.mostRecurringListName || "Desconocido",
        [props?.mostRecurringListName],
    );

    /**
     * Chart Data
     *
     * Maps the sorted backend slices into the structure required by Nivo,
     * injecting icons and colors based on the solar palette.
     * Memoized to prevent recalculating the color map array and object structures during re-renders.
     */
    const chartData = useMemo(() => {
        return sortedSlices.map((slice, index) => ({
            id: slice.sliceId.toString(),
            label: slice.sliceName,
            minutes: slice.timeDedicated,
            basePercentage: slice.percentage,
            iconString: slice.logoOrColour,
            color: SOLAR_PALETTE[index % SOLAR_PALETTE.length],
        }));
    }, [sortedSlices]);

    /**
     * Visible Slices Base
     *
     * Filters out the slices that the user has opted to hide via the projects filter.
     * Memoized to avoid recalculating the filtered array on unrelated state changes.
     */
    const visibleSlicesBase = useMemo(() => {
        return chartData.filter((d) => !hiddenProjects.includes(d.id) && d.basePercentage > 5);
    }, [chartData, hiddenProjects]);

    /**
     * Total Visible Minutes (Percentage)
     *
     * Computes the total sum of base percentages across all currently visible slices
     * to calculate proportional percentages.
     * Memoized to prevent recalculation of the total sum unless visible slices change.
     */
    const totalVisiblePercentage = useMemo(() => {
        return visibleSlicesBase.reduce((sum, slice) => sum + slice.basePercentage, 0);
    }, [visibleSlicesBase]);

    /**
     * Visible Chart Data
     *
     * Enhances the visible slices with their calculated percentage values for display in labels.
     * Memoized to avoid generating a new array of objects on every render cycle.
     */
    const visibleChartData = useMemo(() => {
        return visibleSlicesBase.map((slice) => ({
            ...slice,
            value: totalVisiblePercentage > 0 ? Math.round((slice.basePercentage / totalVisiblePercentage) * 100) : 0,
        }));
    }, [visibleSlicesBase, totalVisiblePercentage]);

    /**
     * Recurring Data
     *
     * Finds the specific slice data matching the most recurring list name to extract its styling.
     * Memoized to avoid searching the array on every re-render.
     */
    const recurringData = useMemo(() => {
        return chartData.find((d) => d.label === mostRecurringName);
    }, [chartData, mostRecurringName]);

    /**
     * Recurring Background Color
     *
     * Extracts the specific background color for the recurring project, with a fallback.
     * Memoized to maintain stable color references across re-renders.
     */
    const recurringBgColor = useMemo(() => {
        return recurringData ? recurringData.color : colors.primary[100];
    }, [recurringData]);

    /**
     * Recurring Icon Component
     *
     * Dynamically retrieves the React Icon component for the most recurring list.
     * Memoized to prevent resolving the icon component multiple times unnecessarily.
     */
    const RecurringIcon = useMemo(() => {
        return getIconComponent(recurringData?.iconString);
    }, [recurringData?.iconString]);

    // --- 5. Interaction Handlers ---

    /**
     * Open Drawer Handler
     *
     * Opens the specified filter drawer. If opening the projects drawer,
     * it clones the current `hiddenProjects` state to the `tempHiddenProjects` state
     * so edits can be made non-destructively.
     *
     * @param {string} drawerType - The type of drawer to open ("TIME" or "PROJECTS").
     */
    const openDrawer = useCallback(
        (drawerType) => {
            if (drawerType === "PROJECTS") {
                setTempHiddenProjects([...hiddenProjects]);
            }
            setActiveDrawer(drawerType);
        },
        [hiddenProjects],
    );

    /**
     * Get Month Name Helper
     *
     * Converts a given Date object into its short, uppercase localized month string (e.g., "ENE").
     *
     * @param {Date} date - The date object to extract the month from.
     * @returns {string} The localized month abbreviation.
     */
    const getMonthName = useCallback((date) => {
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        return months[date.getMonth()];
    }, []);

    /**
     * Get Time Label Handler
     *
     * Computes the human-readable string representation of the current time range
     * based on the selected `timeMode` and `timeOffset` relative to today.
     *
     * @returns {string} The formatted time label string.
     */
    const getTimeLabel = useCallback(() => {
        const today = new Date();

        if (timeMode === "DAILY") {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + timeOffset);
            return `${targetDate.getDate()} ${getMonthName(targetDate)}`;
        }

        if (timeMode === "WEEKLY") {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + timeOffset * 7);

            const dayOfWeek = targetDate.getDay() || 7;
            const startOfWeek = new Date(targetDate);
            startOfWeek.setDate(targetDate.getDate() - dayOfWeek + 1);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
                return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${getMonthName(startOfWeek)}`;
            } else {
                return `${startOfWeek.getDate()} ${getMonthName(startOfWeek)} - ${endOfWeek.getDate()} ${getMonthName(endOfWeek)}`;
            }
        }

        if (timeMode === "MONTHLY") {
            const targetDate = new Date(today);
            targetDate.setMonth(today.getMonth() + timeOffset);
            return getMonthName(targetDate);
        }

        return "";
    }, [timeMode, timeOffset, getMonthName]);

    /**
     * Navigate to Previous Time Period
     *
     * Decrements the time offset to view older data.
     */
    const handlePreviousTime = useCallback(() => setTimeOffset((prev) => prev - 1), []);

    /**
     * Navigate to Next Time Period
     *
     * Increments the time offset to view more recent data, capping at 0 (current period).
     */
    const handleNextTime = useCallback(() => setTimeOffset((prev) => (prev < 0 ? prev + 1 : prev)), []);

    /**
     * Close Drawer Handler
     *
     * Closes the active drawer.
     */
    const closeDrawer = useCallback(() => setActiveDrawer(null), []);

    /**
     * Handle Time Mode Change
     *
     * Updates the chart's time aggregation mode, resets the timeline offset,
     * and automatically closes the drawer if the mode is not custom.
     *
     * @param {string} mode - The selected time mode identifier ("DAILY", "WEEKLY", etc.).
     */
    const handleTimeModeChange = useCallback((mode) => {
        setTimeMode(mode);
        setTimeOffset(0);
        if (mode !== "CUSTOM") {
            setActiveDrawer(null);
        }
    }, []);

    /**
     * Toggle Temporary Project Visibility
     *
     * Adds or removes a project ID from the temporary hidden state array.
     *
     * @param {string} id - The unique identifier of the project to toggle.
     */
    const toggleTempProjectVisibility = useCallback((id) => {
        setTempHiddenProjects((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    }, []);

    /**
     * Apply Project Filters Handler
     *
     * Commits the temporary hidden projects state to the active chart state,
     * triggering a re-render of the chart, and then closes the drawer.
     */
    const applyProjectFilters = useCallback(() => {
        setHiddenProjects([...tempHiddenProjects]);
        setActiveDrawer(null);
    }, [tempHiddenProjects]);

    // --- 6. Return Object ---

    return {
        t,
        solarChartWidgetStates: { activeDrawer, tempHiddenProjects, timeMode, timeOffset },
        solarChartWidgetData: {
            slices,
            mostRecurringName,
            chartData,
            visibleChartData,
            recurringBgColor,
            RecurringIcon,
        },
        solarChartWidgetActions: {
            getIconComponent,
            openDrawer,
            getTimeLabel,
            handlePreviousTime,
            handleNextTime,
            closeDrawer,
            handleTimeModeChange,
            toggleTempProjectVisibility,
            applyProjectFilters,
        },
    };
};

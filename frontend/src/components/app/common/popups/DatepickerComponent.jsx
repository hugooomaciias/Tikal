/** React & Third-Party Libraries */
import { DatePicker, registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/** Contexts, Hooks & Services */
import { useTranslation } from "react-i18next";

/** Icons */
import { IconCalendarWeekFilled } from "@tabler/icons-react";

/** Assets, Utils & Constants */
import es from "date-fns/locale/es";
import en from "date-fns/locale/en-GB";

/** Global Configuration */
registerLocale("es", es);
registerLocale("en", en);

/**
 * Reusable Date Picker Component
 *
 * A customizable wrapper around `react-datepicker` that conforms to the project's
 * design system, including dynamically localized dates, floating labels, and Tailwind classes.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string|null} props.value - Current date in ISO string format, or null.
 * @param {Function} props.onChange - Callback function receiving the new date ISO string.
 * @param {string} props.className - Tailwind classes for the input field.
 * @param {string} props.label - Label text for the input.
 * @returns {JSX.Element} The rendered date picker component.
 */
export const DatePickerComponent = ({ value, onChange, className, label }) => {
    // --- 1. Hooks & Contexts ---

    /**
     * Translation Hook
     *
     * Provides access to the current i18n instance to evaluate active language state.
     */
    const { i18n } = useTranslation();

    // --- 3. Derived Variables ---

    /**
     * Selected Date Object
     *
     * Converts the incoming ISO string value into a native JavaScript Date object
     * required by the internal react-datepicker component.
     */
    const selectedDate = value ? new Date(value) : null;

    /**
     * Current Locale Evaluator
     *
     * Dynamically detects the application's active language and maps it to
     * the corresponding locale configuration for the date picker engine.
     */
    const currentLocale = i18n.language && i18n.language.startsWith("es") ? "es" : "en";

    // --- 5. Event Handlers & Functions ---

    /**
     * Date Change Handler
     *
     * Processes the native Date object returned by react-datepicker
     * and converts it back to an ISO string for the parent component.
     *
     * @param {Date|null} date - The newly selected date object.
     */
    const handleDateChange = (date) => {
        onChange(date ? date.toISOString() : "");
    };

    // --- 6. Render ---

    return (
        <div className="main-datepicker-theme relative w-full flex flex-col group">
            {/* DatePicker Core Engine */}
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                maxLength={10}
                locale={currentLocale}
                dateFormat="dd/MM/yyyy"
                placeholderText=" "
                className={className}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                portalId="root-portal"
                popperClassName="main-datepicker-theme"
            />

            {/* Floating Label */}
            <label
                className={`input-label input-textarea-label-primary pointer-events-none transition-all duration-300 group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500 ${value ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}`}
            >
                {label}
            </label>

            {/* Input Icon Decorator */}
            <div
                className={`input-icon items-center pointer-events-none transition-all duration-300 group-focus-within:opacity-100 group-focus-within:text-primary-500 ${value ? "opacity-100 text-primary-500" : ""}`}
            >
                <IconCalendarWeekFilled className="w-5 h-5" />
            </div>
        </div>
    );
};

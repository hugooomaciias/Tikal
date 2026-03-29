import { DatePicker, registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { IconCalendarWeekFilled } from "@tabler/icons-react";

import "react-datepicker/dist/react-datepicker.css";
registerLocale("es", es);

/**
 * Reusable DatePicker Component
 *
 * @param {Object} props
 * @param {string|null} props.value - Current date in ISO string format, or null.
 * @param {Function} props.onChange - Callback function receiving the new date ISO string.
 * @param {string} props.className - Tailwind classes for the input field (usually includes error states).
 * @param {string} props.label - Label for the input.
 */
export const DatePickerComponent = ({ value, onChange, className, label }) => {
    return (
        <div className="main-datepicker-theme relative w-full flex flex-col group">
            <DatePicker
                selected={value ? new Date(value) : null}
                onChange={(date) => {
                    onChange(date ? date.toISOString() : "");
                }}
                maxLength={10}
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText=" "
                className={className}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />

            <label
                className={`input-label input-textarea-label-primary pointer-events-none transition-all duration-300
                                            group-focus-within:-translate-y-3 group-focus-within:text-xs group-focus-within:opacity-100 group-focus-within:font-medium group-focus-within:text-primary-500
                                            ${value ? "-translate-y-3 text-xs opacity-100 font-medium text-primary-500" : ""}
                                        `}
            >
                {label}
            </label>

            <div
                className={`input-icon items-center pointer-events-none transition-all duration-300
                                            group-focus-within:opacity-100 group-focus-within:text-primary-500
                                            ${value ? "opacity-100 text-primary-500" : ""}
                                        `}
            >
                <IconCalendarWeekFilled className="w-5 h-5" />
            </div>
        </div>
    );
};

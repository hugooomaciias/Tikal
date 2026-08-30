/** Contexts, Hooks & Services */
import { useTeamPopUpLogic } from "../../../../hooks/components/app/main/teams/useTeamPopUpLogic.js";

/** Components & Layouts */
import { TabsComponent } from "../common/popups/TabsComponent.jsx";

/** Icons */
import { IconCircleXFilled, IconAlertTriangleFilled, IconLoader, IconUpload, IconTrash } from "@tabler/icons-react";

/**
 * Team PopUp Component
 *
 * A purely visual presentational component responsible for rendering a modal overlay
 * that allows users to create a new team, join an existing team via an invite code, 
 * or edit a team's details (name and avatar). All complex form validation, file handling,
 * state management, and API submissions are delegated entirely to the `useTeamPopUpLogic` headless hook.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onClose - Callback function triggered to close the modal.
 * @param {Object|null} props.initialData - Initial data injected when editing an existing team. Null if creating/joining.
 * @param {boolean} props.viewAsAdmin - Flag indicating if the current user has activated the admin view.
 * @param {Function} props.t - Translation function from i18next for multi-language support.
 * @returns {JSX.Element} The rendered Team PopUp modal component.
 */
export const TeamPopUpComponent = ({ onClose, initialData, viewAsAdmin, t }) => {
    // --- 1. Logic Hook Extraction ---

    /**
     * Logic Hook Destructuring
     *
     * Extracts all necessary form states, validation errors, file references, 
     * and submission handlers from the headless hook to drive the visual render cycle.
     */
    const { teamStates, teamData, teamActions } = useTeamPopUpLogic(t, initialData, onClose, viewAsAdmin);

    const {
        formData, 
        errors, 
        isLoading, 
        apiError, 
        isVisible, 
        fileInputRef, 
        avatarPreview
    } = teamStates;
    const { isEditing } = teamData;
    const {
        handleChange,
        handleSubmit,
        handleClose,
        handleTabTypeChange,
        handleTriggerFileInput,
        handleAvatarChange,
        handleDeleteAvatar,
        getInputClass,
    } = teamActions;

    // --- 2. Render ---

    return (
        <div
            onClick={handleClose}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {/* Header Section: Dynamic Title & Close Action */}
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-quaternary-700">
                        {isEditing ? t("teams.popup.title.edit") : formData.type === "create" ? t("teams.popup.title.new.create") : t("teams.popup.title.new.join")}
                    </span>

                    <button
                        type="button"
                        className="text-primary-500/70 hover:text-primary-500 transition-colors"
                        onClick={handleClose}
                    >
                        <IconCircleXFilled className="h-8 w-8" />
                    </button>
                </div>

                {/* Main Submission Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    {!isEditing && (
                        <TabsComponent
                            page={"Teams"}
                            formData={formData}
                            onChangeType={handleTabTypeChange}
                            fieldToUpdate={"type"}
                            t={t}
                        />
                    )}

                    {/* Avatar section */}
                    {isEditing && (
                        <div className="flex flex-col items-center justify-center gap-3 py-2">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md flex items-center justify-center">
                                <img
                                    src={
                                        avatarPreview || 
                                        `https://api.dicebear.com/10.x/triangles/svg?backgroundColor=3B7A57,2F6C4B,26563D,204533,1B392A,0E2018,2AB7CA,228498,226B7C,245866,224A57,11303B&seed=${encodeURIComponent(formData.name || "Team")}`
                                    }
                                    alt="Team Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleTriggerFileInput}
                                    className="flex items-center gap-1.5 bg-primary-700 text-primary hover:bg-primary-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all"
                                >
                                    <IconUpload className="w-3.5 h-3.5" />
                                    <span>{t("teams.popup.image.upload")}</span>
                                </button>

                                {avatarPreview && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteAvatar}
                                        className="flex items-center gap-1.5 bg-tertiary-200/90 text-primary hover:bg-tertiary-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all"
                                        title="Restaurar avatar por defecto"
                                    >
                                        <IconTrash className="w-3.5 h-3.5" />
                                        <span>{t("teams.popup.image.delete")}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Title input */}
                    <div className="flex items-center gap-3">
                        {/* Entity Title Input Wrapper */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder=" "
                                value={formData.name}
                                onChange={handleChange}
                                className={getInputClass("name")}
                            />

                            <label htmlFor="name" className="input-label input-textarea-label-primary">
                                {isEditing || formData.type === "create" ? t("teams.popup.name.create") : t("teams.popup.name.join")}
                            </label>

                            {/* Title Validation Error Message */}
                            {errors.name && (
                                <span className="absolute -bottom-5 left-0 text-tertiary-200 text-xs font-semibold">
                                    {errors.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Form Submission Action */}
                    <button type="submit" className="btn btn-primary md:min-w-1/2 mx-auto flex items-center gap-4">
                        <span>
                            {isLoading
                                ? isEditing
                                    ? t("teams.popup.button.edit.loading")
                                    : formData.type === "create"
                                      ? t("teams.popup.button.new.create.loading")
                                      : t("teams.popup.button.new.join.loading")
                                : isEditing
                                    ? t("teams.popup.button.edit.loaded")
                                    : formData.type === "create"
                                      ? t("teams.popup.button.new.create.loaded")
                                      : t("teams.popup.button.new.join.loaded")}
                        </span>

                        {/* Processing Spinner */}
                        {isLoading && <IconLoader className="h-6 w-6 text-primary animate-spin" />}
                    </button>
                </form>
            </div>

            {apiError && (
                <div
                    className={`absolute bottom-8 left-0 right-0 mx-auto w-[90%] md:w-fit md:min-w-[350px] max-w-md bg-primary border-2 border-tertiary-200 text-tertiary-200 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl transition-all duration-500 ease-out z-50
                                ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
                    role="alert"
                >
                    <IconAlertTriangleFilled className="h-6 w-6 shrink-0" />
                    <span className="block sm:inline font-medium text-center">{apiError}</span>
                </div>
            )}
        </div>
    );
};

/** Assets & Icons */
import { IconLayoutKanban, IconLayoutKanbanFilled, IconPlusFilled } from "@tabler/icons-react";

export const HeaderComponent = ({ page, get, set, t }) => {
    return (
        <div className="flex items-center justify-between">
            <div className="h-full w-fit bg-primary flex items-center px-5 py-3 rounded-full shadow-md">
                <h2 className="text-2xl text-primary-600 font-bold">{page}</h2>
            </div>

            <div className="h-full w-fit flex items-center gap-4 rounded-full">
                {page === t("tasks_title") && (
                    <button
                        className={`h-fit w-fit ${get ? "bg-primary-600" : "bg-primary"} p-2 rounded-full shadow-md`}
                        onClick={() => set(!get)}
                    >
                        {!get ? (
                            <IconLayoutKanban className="w-8 h-8 text-primary-600" />
                        ) : (
                            <IconLayoutKanbanFilled className="w-8 h-8 text-primary" />
                        )}
                    </button>
                )}

                {page === t("calendar_title") && (
                    <button
                        className="h-fit w-fit bg-primary text-primary-600 hover:bg-primary-600 hover:text-primary p-2 rounded-full shadow-md transition-colors duration-200"
                        onClick={() => set(!get)}
                    >
                        <IconPlusFilled className="w-8 h-8" />
                    </button>
                )}

                <button className="h-fit w-fit bg-primary p-3 rounded-full shadow-md">
                    <img className="w-10 h-10" src="/public/sabidurIAIcon.svg" alt="Icono Dios de la Sabiduría" />
                </button>
            </div>
        </div>
    );
};

import React, { useState } from "react";
import { IconCircleXFilled, IconWriting } from "@tabler/icons-react";

export const RenameComponent = ({ onClose, eventData, onRename }) => {
    // Inicializamos el input con el título actual del evento
    const [newName, setNewName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newName.trim() === "") return;

        // Aquí llamas a la función que actualice tu backend / estado global
        if (onRename) {
            onRename(eventData.id, newName);
        }

        onClose(); // Cerramos el modal tras guardar
    };

    return (
        /* Modal Overlay Container */
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal Content Container */}
            <div
                className="relative w-[90%] max-w-md shadow-2xl flex flex-col gap-6 bg-primary-50 rounded-[2.5rem] p-8 animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Evita que al hacer clic dentro se cierre
            >
                <div className="flex flex-col gap-2">
                    {/* Header: Title and Close Action */}
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-quaternary-700">Renombrar Evento</span>

                        <button
                            type="button"
                            className="text-primary-500/70 hover:text-primary-500 transition-colors"
                            onClick={onClose}
                        >
                            <IconCircleXFilled className="h-8 w-8" />
                        </button>
                    </div>

                    {/* Banner del Evento Actual */}
                    <div
                        className="flex items-center justify-center py-3 px-4 mt-4 rounded-xl text-primary shadow-sm"
                        style={{ backgroundColor: eventData?.color?.hex || "#ccc" }}
                    >
                        <span className="font-bold text-center truncate w-full">{eventData?.title}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                    {/* Input de Nombre (Usamos 'input' simple, no 'textarea') */}
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="newName"
                            name="newName"
                            placeholder=" "
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            className="input input-textarea-primary peer"
                        />

                        <label htmlFor="newName" className="input-label input-textarea-label-primary">
                            Nuevo nombre
                        </label>

                        <div className="input-icon peer-focus:text-primary-500 peer-[:not(:placeholder-shown)]:text-primary-500 items-center">
                            <IconWriting className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Confirmation Action Button */}
                    <button
                        type="submit"
                        className="btn btn-primary md:min-w-1/2 mx-auto"
                        disabled={newName.trim() === ""}
                    >
                        <span>Renombrar</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

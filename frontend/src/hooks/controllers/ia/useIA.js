/** React & Context */
import { useContext } from "react";

/** Contexts, Hooks & Services */
import { SyncContext } from "../../../context/SyncContext.jsx";
import { iaService } from "../../../services/workspace/ia/iaService.js";

/**
 * AI Controller Hook
 *
 * Acts as the controller layer between the `aiService` API wrapper and
 * the global application state managed by `SyncContext`. It ensures that 
 * whenever a new chat is created, updated, or interacted with, the global 
 * `aiSessions` list (used by the Navbar and history features) is optimistically 
 * or reactively updated without requiring page reloads.
 *
 * @function
 * @returns {Object} An object exposing the AI session and messaging action methods:
 *   `loadSessions`, `createEmptySession`, `renameSession`, `getSessionMessages`,
 *   `sendMessage`, and `sendInitialMessage`.
 */
export const useIA = () => {
    // --- 1. Global State & Dependencies ---

    const { updateContextData } = useContext(SyncContext);

    // --- 2. Action Methods ---

    /**
     * Load All Sessions
     *
     * Fetches the complete list of chat sessions from the backend and completely
     * overwrites the `aiSessions` state in the global context.
     *
     * @async
     * @returns {Promise<Array<Object>>} The array of retrieved sessions.
     * @throws {Error} Re-throws the service error after logging.
     */
    const loadSessions = async () => {
        try {
            const sessions = await iaService.getAllSessions();
            
            updateContextData("aiSessions", () => sessions);
            
            return sessions;
        } catch (error) {
            console.error("Error cargando el historial de sesiones de IA:", error);
            throw error;
        }
    };

    /**
     * Create Empty Session
     *
     * Delegates to `aiService.createEmptySession` to initialize a new chat ID,
     * then performs a global context update to unshift (prepend) the new session
     * at the top of the `aiSessions` array so the Navbar updates instantly.
     *
     * @async
     * @returns {Promise<Object>} The newly created session metadata.
     * @throws {Error} Re-throws the service error after logging.
     */
    const createEmptySession = async () => {
        try {
            const newSession = await iaService.createEmptySession();

            updateContextData("aiSessions", (currentSessions = []) => {
                return [newSession, ...currentSessions];
            });

            return newSession;
        } catch (error) {
            console.error("Error creando una nueva sesión de IA:", error);
            throw error;
        }
    };

    /**
     * Rename Session
     *
     * Updates the title of an existing session in the backend and reflects the
     * change in the global state by mapping over `aiSessions` and replacing the title.
     *
     * @async
     * @param {string|number} sessionId - The target session identifier.
     * @param {string} newTitle - The newly generated contextual title.
     * @returns {Promise<Object>} The updated session object.
     * @throws {Error} Re-throws the service error after logging.
     */
    const renameSession = async (sessionId, newTitle) => {
        try {
            const updatedSession = await iaService.updateSessionTitle(sessionId, newTitle);

            updateContextData("aiSessions", (currentSessions = []) => {
                return currentSessions.map(session => 
                    session.id === sessionId ? updatedSession : session
                );
            });

            return updatedSession;
        } catch (error) {
            console.error(`Error renombrando la sesión ${sessionId}:`, error);
            throw error;
        }
    };

    /**
     * Delete Session
     *
     * Delegates to the API to permanently delete a chat session. Upon success, 
     * it filters the session out of the global `aiSessions` array so it is 
     * instantly removed from the UI navigation.
     *
     * @async
     * @param {string|number} sessionId - The unique identifier of the chat session to delete.
     * @returns {Promise<void>} Resolves when the session is successfully deleted and state is updated.
     * @throws {Error} Re-throws the service error after logging.
     */
    const deleteSession = async (sessionId) => {
        try {
            await iaService.deleteSession(sessionId);

            updateContextData("aiSessions", (currentSessions = []) => {
                return currentSessions.filter(session => session.id !== sessionId);
            });
        } catch (error) {
            console.error(`Error eliminando la sesión ${sessionId}:`, error);
            throw error;
        }
    };

    /**
     * Get Session Messages (Paginated)
     *
     * Fetches a paginated chunk of messages for a specific session. This is a read-only
     * operation relative to global state; it returns the payload directly to the caller 
     * (the chat UI component) to manage local concatenation and scrolling logic.
     *
     * @async
     * @param {string|number} sessionId - The active chat session ID.
     * @param {number} page - The requested page index.
     * @param {number} size - The page size limit.
     * @returns {Promise<Object>} The Pageable response containing the messages array.
     * @throws {Error} Re-throws the service error after logging.
     */
    const getSessionMessages = async (sessionId, page = 0, size = 20) => {
        try {
            return await iaService.getSessionMessages(sessionId, page, size);
        } catch (error) {
            console.error(`Error obteniendo mensajes para la sesión ${sessionId}:`, error);
            throw error;
        }
    };

    /**
     * Send Message (Existing Session)
     *
     * Dispatches a user prompt to an ongoing session. Upon receiving the AI's response,
     * it updates the global session list to bump this session to the top (index 0) 
     * and refreshes its `updatedAt` timestamp, mirroring standard chat app behavior.
     *
     * @async
     * @param {string|number} sessionId - The active chat session ID.
     * @param {string} content - The user's input prompt.
     * @returns {Promise<Object>} The AI's response message object.
     * @throws {Error} Re-throws the service error after logging.
     */
    const sendMessage = async (sessionId, content) => {
        try {
            const aiMessage = await iaService.sendMessageToSession(sessionId, content);

            updateContextData("aiSessions", (currentSessions = []) => {
                const targetSessionIndex = currentSessions.findIndex(s => s.id === sessionId);
                
                if (targetSessionIndex === -1) return currentSessions;

                const targetSession = {
                    ...currentSessions[targetSessionIndex],
                    updatedAt: new Date().toISOString()
                };

                const remainingSessions = currentSessions.filter(s => s.id !== sessionId);

                return [targetSession, ...remainingSessions];
            });

            return aiMessage;
        } catch (error) {
            console.error("Error enviando mensaje a la IA:", error);
            throw error;
        }
    };

    /**
     * Send Message (New Session)
     *
     * Executes the backend's dual-action endpoint (creates session + responds to message).
     * It extracts the newly minted session metadata, unshifts it into the global 
     * `aiSessions` list, and returns the complete payload to hydrate the chat view.
     *
     * @async
     * @param {string} content - The user's initial input prompt.
     * @returns {Promise<Object>} Object containing { session, firstAiMessage }.
     * @throws {Error} Re-throws the service error after logging.
     */
    const sendInitialMessage = async (content) => {
        try {
            const response = await iaService.sendMessageToNewSession(content);
            
            updateContextData("aiSessions", (currentSessions = []) => {
                return [response.session, ...currentSessions];
            });

            return response;
        } catch (error) {
            console.error("Error iniciando nueva conversación con la IA:", error);
            throw error;
        }
    };

    // --- 3. Return Object ---

    return {
        loadSessions,
        createEmptySession,
        renameSession,
        deleteSession,
        getSessionMessages,
        sendMessage,
        sendInitialMessage
    };
};
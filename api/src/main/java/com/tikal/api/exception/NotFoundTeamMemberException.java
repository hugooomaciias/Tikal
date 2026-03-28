package com.tikal.api.exception;

public class NotFoundTeamMemberException extends RuntimeException {
    public NotFoundTeamMemberException(String userName, String teamName) {
        super("El usuario '" + userName + "' no pertenece al equipo '" + teamName + "'");
    }
}

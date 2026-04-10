package com.tikal.api.exception;

public class NotFoundTeamException extends RuntimeException {
    public NotFoundTeamException(String invitationCode) {
        super("No existe un equipo con el código de invitación '" + invitationCode + "'");
    }
}

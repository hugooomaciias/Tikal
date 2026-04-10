package com.tikal.api.exception;

public class TeamBadRequestException extends RuntimeException {
    public TeamBadRequestException(String msg) {
        super("El equipo '" + msg + "' sobre el que se intenta crear el proyecto, no exise");
    }
}

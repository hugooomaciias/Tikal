package com.tikal.api.exception;

public class NotFoundRankException extends RuntimeException {
    public NotFoundRankException() {
        super("No existe rango no existe");
    }
}

package com.tikal.api.exception;

public class NotFoundUserException extends RuntimeException {
    public NotFoundUserException () {
        super("No se ha encontrado ningún usuario con esas credenciales");
    }
}

package com.tikal.api.exception;

public class EmailAndNameAlreadyExistsException extends ResourceAlreadyExistsException {
    public EmailAndNameAlreadyExistsException (String email, String name) {
        super("El email '" + email + "' y el nombre de usuario '" + name + "' ya existen", "3 Data conflict");
    }
}

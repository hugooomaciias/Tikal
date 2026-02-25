package com.tikal.api.exception;

public class EmailAndNameAlreadyExistsException extends ResourceAlreadyExistsException {
    public EmailAndNameAlreadyExistsException (String email, String name) {
        super("The email " + email + " and the user name " + name + " already exists", "3 Data conflict");
    }
}

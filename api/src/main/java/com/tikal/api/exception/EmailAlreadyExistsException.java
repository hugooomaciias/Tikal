package com.tikal.api.exception;

public class EmailAlreadyExistsException extends ResourceAlreadyExistsException {
    public EmailAlreadyExistsException(String email){
        super("The email " + email + " already exists on the platform.", "2 Data conflict");
    }
}

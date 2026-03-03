package com.tikal.api.exception;

public class EmailAlreadyExistsException extends ResourceAlreadyExistsException {
    public EmailAlreadyExistsException(String email){
        super("El email '" + email + "' ya existe en la plataforma", "2 Data conflict");
    }
}

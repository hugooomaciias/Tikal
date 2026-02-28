package com.tikal.api.exception;

public class NameAlreadyExistsException extends ResourceAlreadyExistsException {
    public NameAlreadyExistsException (String name){
        super("The user with the name " + name + " already exists on the platform.", "1 Data conflict");
    }
}

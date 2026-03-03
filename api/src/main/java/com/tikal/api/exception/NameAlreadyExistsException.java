package com.tikal.api.exception;

public class NameAlreadyExistsException extends ResourceAlreadyExistsException {
    public NameAlreadyExistsException (String name){
        super("El usuario con el nombre '" + name + "' ya existe en la plataforma", "1 Data conflict");
    }
}

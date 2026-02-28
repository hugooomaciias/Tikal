package com.tikal.api.exception;

public class NotFoundUserException extends RuntimeException {
    public NotFoundUserException () {
        super("User not found with those credentials");
    }
}

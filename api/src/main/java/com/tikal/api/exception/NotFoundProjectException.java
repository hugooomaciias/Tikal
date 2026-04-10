package com.tikal.api.exception;

public class NotFoundProjectException extends RuntimeException {
    public NotFoundProjectException (String msg) {
        super(msg);
    }
}

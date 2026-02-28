package com.tikal.api.exception;

public class ResourceAlreadyExistsException extends RuntimeException {
    private final String errorCode;

    public ResourceAlreadyExistsException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

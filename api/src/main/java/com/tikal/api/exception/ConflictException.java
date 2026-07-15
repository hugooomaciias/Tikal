package com.tikal.api.exception;

import lombok.Getter;

@Getter
public class ConflictException extends RuntimeException {
    private final String customCode;

    public ConflictException(String message) {
        super(message);
        this.customCode = null;
    }

    public ConflictException(String message, String customCode) {
        super(message);
        this.customCode = customCode;
    }
}

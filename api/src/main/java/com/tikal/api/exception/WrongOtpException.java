package com.tikal.api.exception;

public class WrongOtpException extends RuntimeException {
    public WrongOtpException(String msg) {
        super(msg);
    }
}

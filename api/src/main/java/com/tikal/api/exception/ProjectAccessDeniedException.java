package com.tikal.api.exception;

import java.nio.file.AccessDeniedException;

public class ProjectAccessDeniedException extends RuntimeException {
    public ProjectAccessDeniedException (String msg) {
        super(msg);
    }
}

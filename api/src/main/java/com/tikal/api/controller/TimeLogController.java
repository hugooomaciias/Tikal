package com.tikal.api.controller;

import com.tikal.api.service.TimeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/time_log")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TimeLogController {
    private final TimeLogService timeLogService;
}

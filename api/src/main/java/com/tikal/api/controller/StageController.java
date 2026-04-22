package com.tikal.api.controller;

import com.tikal.api.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stage")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StageController {
    private final StageService stageService;

/*    @GetMapping
    public ResponseEntity<List<StageDTO>> getMyTasks() {
        return ResponseEntity.ok(stageService.getMyStages());
    }*/
}

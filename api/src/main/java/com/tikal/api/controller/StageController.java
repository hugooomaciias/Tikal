package com.tikal.api.controller;

import com.tikal.api.model.dto.task.StageRequest;
import com.tikal.api.model.dto.task.StageDTO;
import com.tikal.api.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stage")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StageController {
    private final StageService stageService;

    @GetMapping
    public ResponseEntity<List<StageDTO>> getMyStages() {
        return ResponseEntity.ok(stageService.getMyStages());
    }

    @GetMapping("/by_project/{id}")
    public ResponseEntity<List<StageDTO>> getStagesByProject(@PathVariable("id") Integer projectId) {
        return ResponseEntity.ok(stageService.getStagesByProject(projectId));
    }

    @PostMapping
    public ResponseEntity<StageDTO> createStage(@RequestBody StageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(stageService.createStage(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStage(@PathVariable("id") Integer id) {
        stageService.deleteStage(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<StageDTO> updateStage(
            @PathVariable("id") Integer stageId,
            @RequestBody StageRequest request) {
        return ResponseEntity.ok(stageService.updateStage(stageId, request));
    }
}

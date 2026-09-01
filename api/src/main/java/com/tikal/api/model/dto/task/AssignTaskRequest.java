package com.tikal.api.model.dto.task;

import lombok.Data;

import java.util.List;

@Data
public class AssignTaskRequest {
    private List<Integer> assignedUserIds;
}

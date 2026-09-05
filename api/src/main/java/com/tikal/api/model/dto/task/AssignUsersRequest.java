package com.tikal.api.model.dto.task;

import lombok.Data;

import java.util.List;

@Data
public class AssignUsersRequest {
    private List<Integer> assignedUserIds;
}

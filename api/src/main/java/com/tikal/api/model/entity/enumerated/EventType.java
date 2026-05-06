package com.tikal.api.model.entity.enumerated;

public enum EventType {
    GENERAL,            // Daily activities (meals, gym). The default setting.
    WORK_SESSION,       // Time slots set aside to make progress in an entity (project, stage or task).
    DEADLINE            // Automatically generated milestones (deadlines).
}

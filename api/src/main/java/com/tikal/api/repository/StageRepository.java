package com.tikal.api.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.scheduling.config.Task;

@Repository
public class StageRepository extends JpaRepository<Stage, Integer> {
    /* --- Obtain the stages of a specific project --- */
    List<Task> findByProject_Id(Integer projectId);
}

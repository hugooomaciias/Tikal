package com.tikal.api.repository;

import org.springframework.stereotype.Repository;

import com.tikal.api.model.entity.Stage;
import com.tikal.api.model.entity.Task;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface StageRepository extends JpaRepository<Stage, Integer> {
    /* --- Obtain the stages of a specific project --- */
    List<Task> findByProject_Id(Integer projectId);
}

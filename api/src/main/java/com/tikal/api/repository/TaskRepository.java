package com.tikal.api.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.networknt.schema.OutputFormat.List;
import com.tikal.api.model.entity.Task;

@Repository
public class TaskRepository extends JpaRepository<Task, Integer>{
    /* --- Obtain tasks from a specific phase --- */
    List<Task> findByStage_Id(Integer stageId);
    
    /* --- Obtain subtasks from a parent task --- */
    List<Task> findByParentTask_Id(Integer parentTaskId);
}

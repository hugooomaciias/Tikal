package com.tikal.api.repository;

import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Time_Log;

@Repository
public interface TimeLogRepository extends JpaRepository<Time_Log, Integer> {
    /* --- Obtain time logs from a specific user --- */
    List<Time_Log> findByUser_Id(Integer userId);
    
    /* --- Obtain time logs from a specific project --- */
    List<Time_Log> findByProject_Id(Integer projectId);
    
    /* --- Obtain time logs from a specific stage --- */
    List<Time_Log> findByStage_Id(Integer stageId);
    
    /* --- Obtain time logs from a specific task --- */
    List<Time_Log> findByTask_Id(Integer taskId);
}

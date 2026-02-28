package com.tikal.api.repository;

import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.TimeLog;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, Integer> {
    /* --- Obtain time logs from a specific user --- */
    List<TimeLog> findByUser_Id(Integer userId);
    
    /* --- Obtain time logs from a specific project --- */
    List<TimeLog> findByProject_Id(Integer projectId);
    
    /* --- Obtain time logs from a specific stage --- */
    List<TimeLog> findByStage_Id(Integer stageId);
    
    /* --- Obtain time logs from a specific task --- */
    List<TimeLog> findByTask_Id(Integer taskId);
}

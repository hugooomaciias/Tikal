package com.tikal.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Stage;

@Repository
public interface StageRepository extends JpaRepository<Stage, Integer> {
    /* --- Obtain the stages of a specific project --- */
    List<Stage> findByProject_Id(Integer projectId);

    /* --- Obtain the stages which their projectId are on the list --- */
    List<Stage> findByProject_IdIn(List<Integer> projectIds);

    @Query("SELECT s FROM Stage s " +
            "WHERE s.project.userOwner.id = :userId")
    List<Stage> findByUserId(Integer userId);

    @Query("SELECT s FROM Stage s " +
            "WHERE s.project.userOwner.id = :userId " +
            "AND s.project.id = :projectId")
    List<Stage> findByUserIdAndProjectId(Integer id, Integer projectId);

    /* --- Obtain the stages with this projectId --- */
    List<Stage> findByProjectId(Integer projectId);
}

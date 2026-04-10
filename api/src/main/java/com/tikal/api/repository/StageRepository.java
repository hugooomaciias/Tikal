package com.tikal.api.repository;

import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Stage;

@Repository
public interface StageRepository extends JpaRepository<Stage, Integer> {
    /* --- Obtain the stages of a specific project --- */
    List<Stage> findByProject_Id(Integer projectId);

    /* --- Obtain the stages which their projectId are on the list --- */
    List<Stage> findByProject_IdIn(List<Integer> projectIds);
}

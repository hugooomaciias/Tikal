package com.tikal.api.repository;

import java.util.List;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    /* --- Obtains the projects from the user with this 'Id' --- */
    List<Project> findByUserOwner_Id(Integer userId);
}

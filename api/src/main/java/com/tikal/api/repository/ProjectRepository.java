package com.tikal.api.repository;

import org.springframework.stereotype.Repository;

import com.networknt.schema.OutputFormat.List;

@Repository
public class ProjectRepository extends JpaRepository<Project, Integer> {
    /* --- Obtains the projects from the user with this 'Id' --- */
    List<Project> findByOwnerUser_Id(Integer userId);
}

package com.tikal.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.tikal.api.model.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    /* --- Obtains the projects from the user with this 'Id' --- */
    List<Project> findByUserOwner_Id(Integer userId);

    /* --- Obtains the projects from the team with this 'Id' --- */
    List<Project> findByTeam_Id(Integer teamId);

    /* --- Obtains the projects from the list of teams with those Ids --- */
    List<Project> findByTeamIdIn(List<Integer> teamId);

    /* --- Search for projects whose team has a member who is my user --- */
    @Query("SELECT p FROM Project p JOIN TeamMember tm ON p.team.id = tm.team.id WHERE tm.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Integer userId);

    /* --- Count the user's total projects --- */
    Integer countByUserOwnerId(Integer userId);

    /* --- Fetch everything in one tree --- */
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN FETCH p.stages s " +
            "WHERE p.userOwner.id = :userId")
    List<Project> findProjectsWithStage(@Param("userId") Integer userId);
}

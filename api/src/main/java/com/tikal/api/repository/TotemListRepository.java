package com.tikal.api.repository;

import com.tikal.api.model.entity.TotemList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TotemListRepository extends JpaRepository<TotemList, Integer> {
    /* --- Obtain the totem list of my current rank --- */
    List<TotemList> findByRequiredRankLessThanEqual(Integer rank);
}

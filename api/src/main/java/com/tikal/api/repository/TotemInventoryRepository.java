package com.tikal.api.repository;

import com.tikal.api.model.entity.TotemInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TotemInventoryRepository extends JpaRepository<TotemInventory, Integer> {
    /* --- Obtain the totem inventory of the user by userId --- */
    List<TotemInventory> findByUser_Id(Integer userId);

    /* --- Obtain the totem inventory of the user by userId and the rankId of the user --- */
    List<TotemInventory> findByUserIdAndTotemId(Integer userId, Integer rankId);

    Integer countByUserId(Integer userId);
}

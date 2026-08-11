package com.tikal.api.repository;

import com.tikal.api.model.entity.TotemInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TotemInventoryRepository extends JpaRepository<TotemInventory, Integer> {
    /* --- Obtain the totem inventory of the user by userId --- */
    List<TotemInventory> findByUser_Id(Integer userId);

    /* --- Obtain the totem inventory of the user by userId and the rankId of the user --- */
    List<TotemInventory> findByUser_IdAndTotem_RequiredRank(Integer userId, Integer rankId);

    Integer countByUserId(Integer userId);

    /* --- This method is to insert new totems when the user achieve some progress --- */
    @Modifying
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Query(value = "INSERT INTO totem_inventory (user_id, totem_id) VALUES (:userId, :totemId)", nativeQuery = true)
    void grantTotemToUser(@Param("userId") Integer userId, @Param("totemId") Integer totemId);
}

package com.tikal.api.repository;

import com.tikal.api.model.entity.RankList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RankListRepository extends JpaRepository<RankList, Integer> {

}

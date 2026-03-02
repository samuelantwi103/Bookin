package com.book.in.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.book.in.model.Facility;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {

    List<Facility> findByBuildingId(Long buildingId);
}

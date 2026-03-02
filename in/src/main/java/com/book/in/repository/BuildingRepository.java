package com.book.in.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.book.in.model.Building;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    Optional<Building> findByCode(String code);
}

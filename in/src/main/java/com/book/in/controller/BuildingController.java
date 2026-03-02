package com.book.in.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.book.in.model.Building;
import com.book.in.service.BuildingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/buildings")
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    @GetMapping
    public ResponseEntity<List<Building>> getAllBuildings() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Building> getBuildingById(@PathVariable Long id) {
        return ResponseEntity.ok(buildingService.getBuildingById(id));
    }

    @PostMapping
    public ResponseEntity<Building> createBuilding(@Valid @RequestBody Building building) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buildingService.createBuilding(building));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Building> updateBuilding(@PathVariable Long id, @Valid @RequestBody Building building) {
        return ResponseEntity.ok(buildingService.updateBuilding(id, building));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Long id) {
        buildingService.deleteBuilding(id);
        return ResponseEntity.noContent().build();
    }
}

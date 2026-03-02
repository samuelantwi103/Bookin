package com.book.in.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.book.in.exception.ResourceNotFoundException;
import com.book.in.model.Building;
import com.book.in.repository.BuildingRepository;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;

    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }

    public List<Building> getAllBuildings() {
        return buildingRepository.findAll();
    }

    public Building getBuildingById(Long id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Building not found with id: " + id));
    }

    public Building createBuilding(Building building) {
        return buildingRepository.save(building);
    }

    public Building updateBuilding(Long id, Building details) {
        Building building = getBuildingById(id);
        building.setName(details.getName());
        building.setCode(details.getCode());
        building.setCampus(details.getCampus());
        building.setDescription(details.getDescription());
        building.setImageUrl(details.getImageUrl());
        return buildingRepository.save(building);
    }

    public void deleteBuilding(Long id) {
        Building building = getBuildingById(id);
        buildingRepository.delete(building);
    }
}

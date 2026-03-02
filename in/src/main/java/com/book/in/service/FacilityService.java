package com.book.in.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.book.in.exception.ResourceNotFoundException;
import com.book.in.model.Building;
import com.book.in.model.Facility;
import com.book.in.repository.BuildingRepository;
import com.book.in.repository.FacilityRepository;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final BuildingRepository buildingRepository;

    public FacilityService(FacilityRepository facilityRepository, BuildingRepository buildingRepository) {
        this.facilityRepository = facilityRepository;
        this.buildingRepository = buildingRepository;
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
    }

    public List<Facility> getFacilitiesByBuildingId(Long buildingId) {
        return facilityRepository.findByBuildingId(buildingId);
    }

    public Facility createFacility(Facility facility) {
        if (facility.getBuilding() != null && facility.getBuilding().getId() != null) {
            Building building = buildingRepository.findById(facility.getBuilding().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Building not found with id: " + facility.getBuilding().getId()));
            facility.setBuilding(building);
        }
        return facilityRepository.save(facility);
    }

    public Facility updateFacility(Long id, Facility facilityDetails) {
        Facility facility = getFacilityById(id);
        facility.setName(facilityDetails.getName());
        facility.setLocation(facilityDetails.getLocation());
        facility.setCapacity(facilityDetails.getCapacity());
        facility.setType(facilityDetails.getType());
        facility.setFloor(facilityDetails.getFloor());
        facility.setRoomNumber(facilityDetails.getRoomNumber());
        facility.setDescription(facilityDetails.getDescription());
        facility.setAmenities(facilityDetails.getAmenities());
        facility.setImageUrl(facilityDetails.getImageUrl());
        if (facilityDetails.getBuilding() != null && facilityDetails.getBuilding().getId() != null) {
            Building building = buildingRepository.findById(facilityDetails.getBuilding().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Building not found with id: " + facilityDetails.getBuilding().getId()));
            facility.setBuilding(building);
        }
        return facilityRepository.save(facility);
    }

    public void deleteFacility(Long id) {
        Facility facility = getFacilityById(id);
        facilityRepository.delete(facility);
    }
}

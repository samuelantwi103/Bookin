package com.book.in.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "facilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Facility name is required")
    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "building_id")
    private Building building;

    @NotNull(message = "Facility type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityType type;

    @NotBlank(message = "Location is required")
    @Column(nullable = false)
    private String location;

    private String floor;

    private String roomNumber;

    @Positive(message = "Capacity must be a positive number")
    @Column(nullable = false)
    private int capacity;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String amenities;

    private String imageUrl;
}

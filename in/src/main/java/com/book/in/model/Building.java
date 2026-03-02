package com.book.in.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "buildings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Building name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Building code is required")
    @Column(nullable = false, unique = true)
    private String code;

    @NotBlank(message = "Campus location is required")
    @Column(nullable = false)
    private String campus;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;
}

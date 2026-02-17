package com.book.in.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.book.in.service.BookingService;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    private final BookingService bookingService;

    public AvailabilityController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<String>> checkAvailability(
            @RequestParam Long facilityId,
            @RequestParam String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        List<String> slots = bookingService.getAvailableSlots(facilityId, parsedDate);
        return ResponseEntity.ok(slots);
    }
}

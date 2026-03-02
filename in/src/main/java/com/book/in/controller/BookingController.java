package com.book.in.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.book.in.model.Booking;
import com.book.in.model.BookingStatus;
import com.book.in.service.BookingService;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) Long userId) {
        if (userId != null) {
            return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Map<String, Object> request) {
        Long facilityId = Long.valueOf(request.get("facilityId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        LocalTime startTime = LocalTime.parse(request.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(request.get("endTime").toString());
        String purpose = request.get("purpose") != null ? request.get("purpose").toString() : null;

        Booking booking = bookingService.createBooking(facilityId, userId, date, startTime, endTime, purpose);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Long facilityId = Long.valueOf(request.get("facilityId").toString());
        Long userId = Long.valueOf(request.get("userId").toString());
        LocalDate date = LocalDate.parse(request.get("date").toString());
        LocalTime startTime = LocalTime.parse(request.get("startTime").toString());
        LocalTime endTime = LocalTime.parse(request.get("endTime").toString());
        BookingStatus status = BookingStatus.valueOf(request.get("status").toString().toUpperCase());
        String purpose = request.get("purpose") != null ? request.get("purpose").toString() : null;

        Booking booking = bookingService.updateBooking(id, facilityId, userId, date, startTime, endTime, status, purpose);
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");
        return ResponseEntity.ok(response);
    }
}

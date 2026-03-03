package com.book.in.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.book.in.exception.BookingConflictException;
import com.book.in.exception.ResourceNotFoundException;
import com.book.in.model.AvailabilitySlot;
import com.book.in.model.Booking;
import com.book.in.model.BookingStatus;
import com.book.in.model.Facility;
import com.book.in.model.User;
import com.book.in.repository.BookingRepository;
import com.book.in.repository.FacilityRepository;
import com.book.in.repository.UserRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          FacilityRepository facilityRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking createBooking(Long facilityId, Long userId,
                                  LocalDate date, LocalTime startTime, LocalTime endTime, String purpose) {
        // Validate facility and user exist
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check for time conflicts
        checkForConflicts(facilityId, date, startTime, endTime);

        Booking booking = new Booking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPurpose(purpose);

        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Long facilityId, Long userId,
                                  LocalDate date, LocalTime startTime, LocalTime endTime,
                                  BookingStatus status, String purpose) {
        Booking booking = getBookingById(id);

        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check for conflicts (excluding this booking's current slot)
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                facilityId, date, startTime, endTime, BookingStatus.CANCELLED);
        conflicts.removeIf(b -> b.getId().equals(id));
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflicts with an existing booking for this facility");
        }

        booking.setFacility(facility);
        booking.setUser(user);
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(status);
        booking.setPurpose(purpose);

        return bookingRepository.save(booking);
    }

    public Booking approveBooking(Long id) {
        Booking booking = getBookingById(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BookingConflictException("Only pending bookings can be approved");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    public void cancelBooking(Long id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    // Returns available 30-minute slots for a facility on a given date
    public List<AvailabilitySlot> getAvailableSlots(Long facilityId, LocalDate date) {
        // Verify facility exists
        facilityRepository.findById(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        // Get all confirmed bookings for this facility on this date
        List<Booking> bookings = bookingRepository.findConflictingBookings(
                facilityId, date,
                LocalTime.of(8, 0), LocalTime.of(20, 0),
                BookingStatus.CANCELLED);

        // Generate 30-minute slots from 08:00 to 20:00
        List<AvailabilitySlot> slots = new ArrayList<>();
        LocalTime slotStart = LocalTime.of(8, 0);
        LocalTime dayEnd = LocalTime.of(20, 0);

        while (slotStart.isBefore(dayEnd)) {
            LocalTime slotEnd = slotStart.plusMinutes(30);
            boolean isBooked = false;

            for (Booking booking : bookings) {
                // Check if this slot overlaps with any booking
                if (slotStart.isBefore(booking.getEndTime()) && slotEnd.isAfter(booking.getStartTime())) {
                    isBooked = true;
                    break;
                }
            }

            slots.add(new AvailabilitySlot(slotStart.toString(), slotEnd.toString(), !isBooked));
            slotStart = slotEnd;
        }

        return slots;
    }

    private void checkForConflicts(Long facilityId, LocalDate date,
                                    LocalTime startTime, LocalTime endTime) {
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                facilityId, date, startTime, endTime, BookingStatus.CANCELLED);
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflicts with an existing booking for this facility");
        }
    }
}

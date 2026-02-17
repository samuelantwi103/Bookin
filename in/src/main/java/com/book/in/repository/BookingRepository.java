package com.book.in.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.book.in.model.Booking;
import com.book.in.model.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByFacilityId(Long facilityId);

    List<Booking> findByUserId(Long userId);

    List<Booking> findByFacilityIdAndDate(Long facilityId, LocalDate date);

    // Check for overlapping bookings on the same facility and date
    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId " +
           "AND b.date = :date " +
           "AND b.status <> :cancelledStatus " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
            @Param("facilityId") Long facilityId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("cancelledStatus") BookingStatus cancelledStatus);
}

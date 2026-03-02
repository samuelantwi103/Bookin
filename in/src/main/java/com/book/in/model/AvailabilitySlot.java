package com.book.in.model;

/**
 * Represents a time slot with availability status.
 */
public class AvailabilitySlot {
    private String startTime;
    private String endTime;
    private boolean available;

    public AvailabilitySlot(String startTime, String endTime, boolean available) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
    }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}

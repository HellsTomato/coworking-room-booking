package ru.coworking.booking.web;

import java.time.LocalDate;
import java.time.OffsetTime;

import ru.coworking.booking.domain.Booking;

public record BookingResponse(
        Long bookingId,
        Long roomId,
        Long userId,
        LocalDate date,
        OffsetTime timeFrom,
        OffsetTime timeTo,
        String status) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getRoom().getId(),
                booking.getUser().getId(),
                booking.getStartsAt().toLocalDate(),
                booking.getStartsAt().toOffsetTime(),
                booking.getEndsAt().toOffsetTime(),
                booking.getStatus().name());
    }
}

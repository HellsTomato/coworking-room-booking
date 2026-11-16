package ru.coworking.booking.web;

import java.time.LocalDate;
import java.time.OffsetTime;

import jakarta.validation.constraints.NotNull;

public record CreateBookingRequest(
        @NotNull Long roomId,
        @NotNull LocalDate date,
        @NotNull OffsetTime timeFrom,
        @NotNull OffsetTime timeTo) {
}

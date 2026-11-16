package ru.coworking.booking.repository;

import java.time.OffsetDateTime;
import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;

import ru.coworking.booking.domain.Booking;
import ru.coworking.booking.domain.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    boolean existsByRoomIdAndStatusInAndStartsAtLessThanAndEndsAtGreaterThan(
            Long roomId,
            Collection<BookingStatus> statuses,
            OffsetDateTime endsAt,
            OffsetDateTime startsAt);
}

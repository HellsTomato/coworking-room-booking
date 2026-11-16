package ru.coworking.booking.service;

import java.time.OffsetDateTime;
import java.util.EnumSet;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import ru.coworking.booking.domain.Booking;
import ru.coworking.booking.domain.BookingStatus;
import ru.coworking.booking.domain.Room;
import ru.coworking.booking.domain.User;
import ru.coworking.booking.repository.BookingRepository;
import ru.coworking.booking.repository.RoomRepository;
import ru.coworking.booking.repository.UserRepository;
import ru.coworking.booking.web.CreateBookingRequest;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public Booking create(CreateBookingRequest request, String email) {
        if (!request.timeFrom().isBefore(request.timeTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "timeFrom must be before timeTo");
        }

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Room does not exist"));
        if (room.isArchived()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Room is archived");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "User does not exist"));
        OffsetDateTime startsAt = request.date().atTime(request.timeFrom());
        OffsetDateTime endsAt = request.date().atTime(request.timeTo());
        if (bookingRepository.existsByRoomIdAndStatusInAndStartsAtLessThanAndEndsAtGreaterThan(
                room.getId(), EnumSet.of(BookingStatus.PENDING, BookingStatus.CONFIRMED),
                endsAt, startsAt)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Room is already booked for the requested time slot");
        }

        return bookingRepository.save(new Booking(user, room, startsAt, endsAt,
                BookingStatus.PENDING));
    }
}

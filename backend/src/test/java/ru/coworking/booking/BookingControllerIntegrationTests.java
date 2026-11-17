package ru.coworking.booking;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import ru.coworking.booking.domain.Booking;
import ru.coworking.booking.domain.BookingStatus;
import ru.coworking.booking.domain.Role;
import ru.coworking.booking.domain.Room;
import ru.coworking.booking.domain.User;
import ru.coworking.booking.repository.BookingRepository;
import ru.coworking.booking.repository.RoomRepository;
import ru.coworking.booking.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookingControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Room room;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        userRepository.deleteAll();
        userRepository.save(new User("employee@example.com", "{noop}password",
                "Employee", Role.EMPLOYEE));
        room = roomRepository.save(new Room("Room 12", 6, "projector", false));
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = "EMPLOYEE")
    void createsPendingBookingAndPersistsIt() throws Exception {
        mockMvc.perform(post("/api/v1/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "roomId": %d,
                                  "date": "2026-12-10",
                                  "timeFrom": "10:00:00+03:00",
                                  "timeTo": "12:00:00+03:00"
                                }
                                """.formatted(room.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PENDING")));

        Booking booking = bookingRepository.findAll().get(0);
        org.junit.jupiter.api.Assertions.assertEquals(BookingStatus.PENDING,
                booking.getStatus());
        org.junit.jupiter.api.Assertions.assertEquals(room.getId(), booking.getRoom().getId());
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = "EMPLOYEE")
    void rejectsOverlappingConfirmedBooking() throws Exception {
        User user = userRepository.findByEmail("employee@example.com").orElseThrow();
        bookingRepository.save(new Booking(user, room,
                OffsetDateTime.parse("2026-12-10T10:00:00+03:00"),
                OffsetDateTime.parse("2026-12-10T12:00:00+03:00"),
                BookingStatus.CONFIRMED));

        mockMvc.perform(post("/api/v1/bookings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "roomId": %d,
                                  "date": "2026-12-10",
                                  "timeFrom": "11:00:00+03:00",
                                  "timeTo": "13:00:00+03:00"
                                }
                                """.formatted(room.getId())))
                .andExpect(status().isConflict());

        org.junit.jupiter.api.Assertions.assertEquals(1, bookingRepository.count());
    }
}

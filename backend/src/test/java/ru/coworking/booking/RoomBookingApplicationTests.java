package ru.coworking.booking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class RoomBookingApplicationTests {

    @Test
    void contextLoads() {
        // The application context must start with the domain model and test profile.
    }
}

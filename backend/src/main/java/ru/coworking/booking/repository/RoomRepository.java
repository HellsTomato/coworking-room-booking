package ru.coworking.booking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import ru.coworking.booking.domain.Room;

public interface RoomRepository extends JpaRepository<Room, Long> {
}

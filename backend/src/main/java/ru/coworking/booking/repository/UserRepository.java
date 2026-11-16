package ru.coworking.booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ru.coworking.booking.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}

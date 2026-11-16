package ru.coworking.booking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private int capacity;

    @Column(nullable = false, length = 500)
    private String equipment;

    @Column(nullable = false)
    private boolean archived;

    protected Room() {
    }

    public Room(String name, int capacity, String equipment, boolean archived) {
        this.name = name;
        this.capacity = capacity;
        this.equipment = equipment;
        this.archived = archived;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getCapacity() {
        return capacity;
    }

    public String getEquipment() {
        return equipment;
    }

    public boolean isArchived() {
        return archived;
    }
}

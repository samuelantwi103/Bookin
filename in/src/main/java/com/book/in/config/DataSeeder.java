package com.book.in.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.book.in.model.Facility;
import com.book.in.model.User;
import com.book.in.repository.FacilityRepository;
import com.book.in.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    public DataSeeder(FacilityRepository facilityRepository, UserRepository userRepository) {
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Only seed if tables are empty
        if (facilityRepository.count() == 0) {
            facilityRepository.save(new Facility(null, "Main Library", "North Campus", 100));
            facilityRepository.save(new Facility(null, "Computer Lab A", "Engineering Block", 40));
            facilityRepository.save(new Facility(null, "Lecture Hall B2", "Science Faculty", 200));
            System.out.println("Seeded 3 facilities");
        }

        if (userRepository.count() == 0) {
            userRepository.save(new User(null, "Samuel Antwi", "samuel@ug.edu.gh", "USER"));
            userRepository.save(new User(null, "Admin User", "admin@ug.edu.gh", "ADMIN"));
            System.out.println("Seeded 2 users");
        }
    }
}

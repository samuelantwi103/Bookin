package com.book.in.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.book.in.model.Building;
import com.book.in.model.Facility;
import com.book.in.model.FacilityType;
import com.book.in.model.User;
import com.book.in.repository.BuildingRepository;
import com.book.in.repository.FacilityRepository;
import com.book.in.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final BuildingRepository buildingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(BuildingRepository buildingRepository,
                      FacilityRepository facilityRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.buildingRepository = buildingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (buildingRepository.count() == 0) {
            seedBuildings();
        }
        if (userRepository.count() == 0) {
            seedUsers();
        }
    }

    private void seedBuildings() {
        // --- Balme Library ---
        Building balme = buildingRepository.save(new Building(null,
                "Balme Library", "BL", "Central Campus",
                "The main university library, established in 1948. Houses extensive collections and modern study spaces.",
                null));
        facilityRepository.save(createFacility("Study Room A", balme, FacilityType.STUDY_ROOM, "2nd Floor", "BL-201", 20,
                "Quiet study room with individual desks and power outlets", "Wi-Fi,Power Outlets,Whiteboard"));
        facilityRepository.save(createFacility("Group Discussion Room", balme, FacilityType.SEMINAR_ROOM, "1st Floor", "BL-108", 12,
                "Collaborative space for group study sessions and discussions", "Wi-Fi,Projector,Whiteboard"));
        facilityRepository.save(createFacility("Digital Media Lab", balme, FacilityType.COMPUTER_LAB, "Ground Floor", "BL-003", 30,
                "Computer lab with multimedia workstations and editing software", "Wi-Fi,Computers,Projector,Sound System"));
        facilityRepository.save(createFacility("Seminar Room 201", balme, FacilityType.SEMINAR_ROOM, "2nd Floor", "BL-201S", 45,
                "Large seminar room for presentations and workshops", "Wi-Fi,Projector,Microphone,Whiteboard"));

        // --- JQB Building ---
        Building jqb = buildingRepository.save(new Building(null,
                "JQB Building", "JQB", "North Campus",
                "Home to the Department of Computer Science and Computer Engineering. Features modern computing facilities.",
                null));
        facilityRepository.save(createFacility("Computer Lab 1", jqb, FacilityType.COMPUTER_LAB, "1st Floor", "JQB-101", 40,
                "Primary computer lab with high-performance workstations", "Wi-Fi,Computers,Projector,Air Conditioning"));
        facilityRepository.save(createFacility("Computer Lab 2", jqb, FacilityType.COMPUTER_LAB, "1st Floor", "JQB-102", 40,
                "Secondary computer lab for programming and practical sessions", "Wi-Fi,Computers,Projector"));
        facilityRepository.save(createFacility("Lecture Hall A", jqb, FacilityType.LECTURE_HALL, "Ground Floor", "JQB-LHA", 150,
                "Main lecture hall with tiered seating and AV equipment", "Wi-Fi,Projector,Microphone,Air Conditioning"));
        facilityRepository.save(createFacility("Seminar Room 101", jqb, FacilityType.SEMINAR_ROOM, "1st Floor", "JQB-SR1", 35,
                "Seminar room for tutorials and small group sessions", "Wi-Fi,Projector,Whiteboard"));

        // --- Great Hall ---
        Building greatHall = buildingRepository.save(new Building(null,
                "Great Hall", "GH", "Central Campus",
                "The iconic Great Hall used for congregations, special events, and high-profile university ceremonies.",
                null));
        facilityRepository.save(createFacility("Main Auditorium", greatHall, FacilityType.AUDITORIUM, "Ground Floor", "GH-MAIN", 1500,
                "Grand auditorium for university ceremonies and large events", "Projector,Microphone,Sound System,Stage,Air Conditioning"));
        facilityRepository.save(createFacility("Conference Room 1", greatHall, FacilityType.CONFERENCE_ROOM, "1st Floor", "GH-CR1", 50,
                "Executive conference room for meetings and symposia", "Wi-Fi,Projector,Video Conferencing,Air Conditioning"));

        // --- N Block ---
        Building nBlock = buildingRepository.save(new Building(null,
                "N Block", "NB", "Science Area",
                "Science faculty building housing lecture theatres and laboratories for natural sciences.",
                null));
        facilityRepository.save(createFacility("Lecture Theatre N1", nBlock, FacilityType.LECTURE_HALL, "Ground Floor", "NB-N1", 200,
                "Large lecture theatre for science courses", "Projector,Microphone,Air Conditioning"));
        facilityRepository.save(createFacility("Lecture Theatre N2", nBlock, FacilityType.LECTURE_HALL, "Ground Floor", "NB-N2", 200,
                "Lecture theatre with modern AV capabilities", "Projector,Microphone,Air Conditioning"));
        facilityRepository.save(createFacility("Chemistry Lab 301", nBlock, FacilityType.LABORATORY, "3rd Floor", "NB-301", 60,
                "Fully equipped chemistry laboratory for practical sessions", "Fume Hood,Lab Equipment,Safety Shower"));

        // --- UGBS Building ---
        Building ugbs = buildingRepository.save(new Building(null,
                "UGBS Building", "UGBS", "East Campus",
                "University of Ghana Business School - a leading centre for business education in West Africa.",
                null));
        facilityRepository.save(createFacility("UGBS Auditorium", ugbs, FacilityType.AUDITORIUM, "Ground Floor", "UGBS-AUD", 300,
                "Modern auditorium for business seminars and guest lectures", "Projector,Microphone,Sound System,Air Conditioning"));
        facilityRepository.save(createFacility("Lecture Hall 101", ugbs, FacilityType.LECTURE_HALL, "1st Floor", "UGBS-101", 120,
                "Standard lecture hall for business courses", "Wi-Fi,Projector,Air Conditioning"));
        facilityRepository.save(createFacility("Executive Boardroom", ugbs, FacilityType.BOARDROOM, "2nd Floor", "UGBS-BR", 20,
                "Premium boardroom for executive meetings and case study sessions", "Wi-Fi,Video Conferencing,Projector,Air Conditioning"));

        // --- Faculty of Law ---
        Building law = buildingRepository.save(new Building(null,
                "Faculty of Law", "LAW", "West Campus",
                "Houses the University of Ghana School of Law, one of the premier law schools in West Africa.",
                null));
        facilityRepository.save(createFacility("Moot Court", law, FacilityType.AUDITORIUM, "Ground Floor", "LAW-MC", 100,
                "Courtroom-style facility for moot court competitions and legal practice", "Microphone,Projector,Court Furniture"));
        facilityRepository.save(createFacility("Law Seminar Room", law, FacilityType.SEMINAR_ROOM, "1st Floor", "LAW-SR1", 40,
                "Seminar room for law tutorials and case discussions", "Wi-Fi,Projector,Whiteboard"));

        // --- Noguchi Memorial Institute ---
        Building noguchi = buildingRepository.save(new Building(null,
                "Noguchi Memorial Institute", "NMI", "South Campus",
                "Premier biomedical research institute named after Dr. Hideyo Noguchi, focusing on infectious disease research.",
                null));
        facilityRepository.save(createFacility("Conference Hall", noguchi, FacilityType.CONFERENCE_ROOM, "1st Floor", "NMI-CH", 80,
                "Conference hall for research presentations and international symposia", "Wi-Fi,Projector,Video Conferencing,Air Conditioning"));
        facilityRepository.save(createFacility("Board Room", noguchi, FacilityType.BOARDROOM, "2nd Floor", "NMI-BR", 16,
                "Board room for committee meetings and research discussions", "Wi-Fi,Projector,Air Conditioning"));

        // --- School of Engineering Sciences ---
        Building eng = buildingRepository.save(new Building(null,
                "School of Engineering Sciences", "ENG", "Engineering Area",
                "Home to Engineering Sciences departments including Computer, Electrical, and Biomedical Engineering.",
                null));
        facilityRepository.save(createFacility("Engineering Lecture Hall", eng, FacilityType.LECTURE_HALL, "Ground Floor", "ENG-LH1", 180,
                "Main lecture hall for engineering courses", "Projector,Microphone,Air Conditioning"));
        facilityRepository.save(createFacility("Robotics Lab", eng, FacilityType.LABORATORY, "1st Floor", "ENG-RL", 25,
                "Hands-on robotics and embedded systems laboratory", "Wi-Fi,Lab Equipment,3D Printer,Workbenches"));
        facilityRepository.save(createFacility("CAD Lab", eng, FacilityType.COMPUTER_LAB, "2nd Floor", "ENG-CAD", 35,
                "Computer-aided design lab with engineering software suites", "Wi-Fi,Computers,Projector,CAD Software"));

        // --- School of Performing Arts ---
        Building spa = buildingRepository.save(new Building(null,
                "School of Performing Arts", "SPA", "Central Campus",
                "Centre for music, dance, drama, and theatre arts education and performances.",
                null));
        facilityRepository.save(createFacility("Efua Sutherland Drama Studio", spa, FacilityType.STUDIO, "Ground Floor", "SPA-DS", 250,
                "Named Drama Studio for theatrical performances and rehearsals", "Stage,Sound System,Lighting,Dressing Room"));
        facilityRepository.save(createFacility("Rehearsal Room 1", spa, FacilityType.STUDIO, "1st Floor", "SPA-RR1", 30,
                "Multi-purpose rehearsal space for music and dance", "Sound System,Mirrors,Piano"));

        // --- College of Education ---
        Building coe = buildingRepository.save(new Building(null,
                "College of Education", "COE", "North Campus",
                "The College of Education building with modern teaching facilities for education students.",
                null));
        facilityRepository.save(createFacility("Lecture Theatre E1", coe, FacilityType.LECTURE_HALL, "Ground Floor", "COE-E1", 200,
                "Large lecture theatre for education courses", "Projector,Microphone,Air Conditioning"));
        facilityRepository.save(createFacility("Seminar Room E101", coe, FacilityType.SEMINAR_ROOM, "1st Floor", "COE-SR1", 40,
                "Seminar room for tutorials and teaching practice sessions", "Wi-Fi,Projector,Whiteboard,Smart Board"));

        System.out.println("Seeded 10 buildings with 25 facilities");
    }

    private void seedUsers() {
        // Default password for all demo accounts: "password123"
        String hashedPassword = passwordEncoder.encode("password123");
        
        userRepository.save(new User(null, "Samuel Antwi", "samuel@ug.edu.gh", "USER", hashedPassword));
        userRepository.save(new User(null, "Admin User", "admin@ug.edu.gh", "ADMIN", hashedPassword));
        userRepository.save(new User(null, "Kwame Mensah", "kwame.mensah@ug.edu.gh", "USER", hashedPassword));
        userRepository.save(new User(null, "Ama Serwaa", "ama.serwaa@ug.edu.gh", "USER", hashedPassword));
        System.out.println("Seeded 4 users (password: password123)");
    }

    private Facility createFacility(String name, Building building, FacilityType type,
                                     String floor, String roomNumber, int capacity,
                                     String description, String amenities) {
        Facility f = new Facility();
        f.setName(name);
        f.setBuilding(building);
        f.setType(type);
        f.setLocation(building.getCampus());
        f.setFloor(floor);
        f.setRoomNumber(roomNumber);
        f.setCapacity(capacity);
        f.setDescription(description);
        f.setAmenities(amenities);
        return f;
    }
}

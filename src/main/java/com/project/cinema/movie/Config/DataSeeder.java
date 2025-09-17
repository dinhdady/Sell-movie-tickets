package com.project.cinema.movie.Config;

import com.project.cinema.movie.Models.*;
import com.project.cinema.movie.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private SeatRepository seatRepository;
    
    @Autowired
    private CinemaRepository cinemaRepository;
    
    @Autowired
    private MovieRepository movieRepository;
    
    @Autowired
    private ShowtimeRepository showtimeRepository;

    @Override
    public void run(String... args) throws Exception {
        seedCinemaAndRoom();
        seedSeatsForRoom1();
        seedShowtimes();
    }
    
    private void seedCinemaAndRoom() {
        // Check if Cinema 1 exists
        Cinema cinema1 = cinemaRepository.findById(1L).orElse(null);
        
        if (cinema1 == null) {
            // Create Cinema 1
            cinema1 = new Cinema();
            cinema1.setName("CGV Vincom Center");
            cinema1.setAddress("191 Bà Triệu, Hai Bà Trưng, Hà Nội");
            cinema1.setPhone("1900-6017");
            cinema1.setCinemaType(CinemaType.STANDARD);
            cinema1 = cinemaRepository.save(cinema1);
            System.out.println("Created Cinema 1: " + cinema1.getName());
        }
        
        // Check if Room 1 exists
        Room room1 = roomRepository.findById(1L).orElse(null);
        
        if (room1 == null) {
            // Create Room 1
            room1 = new Room();
            room1.setName("Phòng 1");
            room1.setCapacity(100);
            room1.setCinema(cinema1);
            room1 = roomRepository.save(room1);
            System.out.println("Created Room 1: " + room1.getName());
        }
    }
    
    private void seedShowtimes() {
        // Check if we have any showtimes
        if (showtimeRepository.count() == 0) {
            // Get movie 1 and room 1
            Movie movie1 = movieRepository.findById(1L).orElse(null);
            Room room1 = roomRepository.findById(1L).orElse(null);
            
            if (movie1 != null && room1 != null) {
                // Create sample showtimes for today
                java.util.Date today = new java.util.Date();
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.setTime(today);
                
                // Showtime 1: 10:00 - 12:00
                cal.set(java.util.Calendar.HOUR_OF_DAY, 10);
                cal.set(java.util.Calendar.MINUTE, 0);
                java.util.Date startTime1 = cal.getTime();
                cal.add(java.util.Calendar.HOUR, 2);
                java.util.Date endTime1 = cal.getTime();
                
                Showtime showtime1 = new Showtime();
                showtime1.setMovie(movie1);
                showtime1.setRoom(room1);
                showtime1.setStartTime(startTime1);
                showtime1.setEndTime(endTime1);
                showtimeRepository.save(showtime1);
                
                // Showtime 2: 14:30 - 16:30
                cal.setTime(today);
                cal.set(java.util.Calendar.HOUR_OF_DAY, 14);
                cal.set(java.util.Calendar.MINUTE, 30);
                java.util.Date startTime2 = cal.getTime();
                cal.add(java.util.Calendar.HOUR, 2);
                java.util.Date endTime2 = cal.getTime();
                
                Showtime showtime2 = new Showtime();
                showtime2.setMovie(movie1);
                showtime2.setRoom(room1);
                showtime2.setStartTime(startTime2);
                showtime2.setEndTime(endTime2);
                showtimeRepository.save(showtime2);
                
                // Showtime 3: 19:00 - 21:00
                cal.setTime(today);
                cal.set(java.util.Calendar.HOUR_OF_DAY, 19);
                cal.set(java.util.Calendar.MINUTE, 0);
                java.util.Date startTime3 = cal.getTime();
                cal.add(java.util.Calendar.HOUR, 2);
                java.util.Date endTime3 = cal.getTime();
                
                Showtime showtime3 = new Showtime();
                showtime3.setMovie(movie1);
                showtime3.setRoom(room1);
                showtime3.setStartTime(startTime3);
                showtime3.setEndTime(endTime3);
                showtimeRepository.save(showtime3);
                
                System.out.println("Created 3 sample showtimes for Movie 1 in Room 1");
            }
        }
    }

    private void seedSeatsForRoom1() {
        // Check if Room 1 exists
        Room room1 = roomRepository.findById(1L).orElse(null);
        
        if (room1 == null) {
            // Create Cinema first if not exists
            Cinema cinema = cinemaRepository.findById(1L).orElse(null);
            if (cinema == null) {
                cinema = new Cinema();
                cinema.setName("CGV Vincom Center");
                cinema.setAddress("72 Lê Thánh Tôn, Quận 1, TP.HCM");
                cinema.setPhone("1900-6017");
                cinema = cinemaRepository.save(cinema);
                System.out.println("Created Cinema: " + cinema.getName());
            }
            
            // Create Room 1
            room1 = new Room();
            room1.setName("Phòng 1");
            room1.setCapacity(100);
            room1.setCinema(cinema);
            room1 = roomRepository.save(room1);
            System.out.println("Created Room 1 with capacity: " + room1.getCapacity());
        }

        // Check if seats already exist for Room 1
        long existingSeatsCount = seatRepository.countByRoomId(1L);
        if (existingSeatsCount >= 100) {
            System.out.println("Room 1 already has " + existingSeatsCount + " seats. Skipping seed.");
            return;
        }

        // Create 100 seats for Room 1 (10 rows x 10 seats)
        String[] rows = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};
        int seatsPerRow = 10;
        int seatCount = 0;

        for (int rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            String row = rows[rowIndex];
            
            for (int seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
                // Determine seat type based on row
                SeatType seatType;
                if (rowIndex < 2) { // Rows A, B = VIP
                    seatType = SeatType.VIP;
                } else if (rowIndex >= 8) { // Rows I, J = COUPLE
                    seatType = SeatType.COUPLE;
                } else { // Rows C-H = REGULAR
                    seatType = SeatType.REGULAR;
                }

                String seatNumberStr = row + seatNumber;
                
                // Check if seat already exists
                if (!seatRepository.existsBySeatNumberAndRoomId(seatNumberStr, room1.getId())) {
                    Seat seat = new Seat();
                    seat.setSeatNumber(seatNumberStr);
                    seat.setRowNumber(row);
                    seat.setColumnNumber(seatNumber);
                    seat.setSeatType(seatType);
                    seat.setRoom(room1);
                    
                    seatRepository.save(seat);
                    seatCount++;
                }
            }
        }

        System.out.println("Successfully created " + seatCount + " seats for Room 1");
        System.out.println("Total seats in Room 1: " + seatRepository.countByRoomId(1L));
    }
}

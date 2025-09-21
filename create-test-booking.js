const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8080';

async function createTestBooking() {
    console.log('🎬 Creating test booking...\n');
    
    try {
        // Step 1: Login as admin to get token
        console.log('1. Logging in as admin...');
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            console.log('❌ Login failed');
            return;
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login successful');
        
        // Step 2: Get movies
        console.log('\n2. Getting movies...');
        const moviesResponse = await fetch(`${BASE_URL}/api/movies`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!moviesResponse.ok) {
            console.log('❌ Failed to get movies');
            return;
        }
        
        const movies = await moviesResponse.json();
        console.log(`✅ Found ${movies.length} movies`);
        
        if (movies.length === 0) {
            console.log('❌ No movies found');
            return;
        }
        
        const movie = movies[0];
        console.log(`   Using movie: ${movie.title} (ID: ${movie.id})`);
        
        // Step 3: Get showtimes for the movie
        console.log('\n3. Getting showtimes...');
        const showtimesResponse = await fetch(`${BASE_URL}/api/movie/${movie.id}/showtimes`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!showtimesResponse.ok) {
            console.log('❌ Failed to get showtimes');
            return;
        }
        
        const showtimes = await showtimesResponse.json();
        console.log(`✅ Found ${showtimes.length} showtimes`);
        
        if (showtimes.length === 0) {
            console.log('❌ No showtimes found');
            return;
        }
        
        const showtime = showtimes[0];
        console.log(`   Using showtime: ${showtime.startTime} (ID: ${showtime.id})`);
        
        // Step 4: Get available seats
        console.log('\n4. Getting available seats...');
        const seatsResponse = await fetch(`${BASE_URL}/api/booking/showtime/${showtime.id}/seats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!seatsResponse.ok) {
            console.log('❌ Failed to get seats');
            return;
        }
        
        const seats = await seatsResponse.json();
        console.log(`✅ Found ${seats.length} available seats`);
        
        if (seats.length === 0) {
            console.log('❌ No available seats found');
            return;
        }
        
        const selectedSeats = seats.slice(0, 2); // Select first 2 seats
        console.log(`   Selected seats: ${selectedSeats.map(s => s.seatNumber).join(', ')}`);
        
        // Step 5: Create booking
        console.log('\n5. Creating booking...');
        const bookingData = {
            showtimeId: showtime.id,
            seats: selectedSeats.map(seat => ({
                seatId: seat.id,
                seatNumber: seat.seatNumber
            })),
            customerName: 'Test Customer',
            customerEmail: 'test@example.com',
            customerPhone: '0123456789'
        };
        
        const bookingResponse = await fetch(`${BASE_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.log('❌ Failed to create booking:', errorText);
            return;
        }
        
        const booking = await bookingResponse.json();
        console.log(`✅ Booking created successfully! ID: ${booking.id}`);
        
        // Step 6: Test getting all bookings
        console.log('\n6. Testing get all bookings...');
        const allBookingsResponse = await fetch(`${BASE_URL}/api/booking`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!allBookingsResponse.ok) {
            console.log('❌ Failed to get all bookings');
            return;
        }
        
        const allBookings = await allBookingsResponse.json();
        console.log(`✅ Found ${allBookings.length} total bookings`);
        
        console.log('\n🎉 Test booking created successfully!');
        console.log('You can now test the BookingManagement page.');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

createTestBooking().catch(console.error);

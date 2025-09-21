const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8080';

async function testDataSeeder() {
    console.log('🧪 Testing Data Seeder...\n');
    
    try {
        // Test if backend is running
        console.log('1. Testing backend connection...');
        const healthResponse = await fetch(`${BASE_URL}/api/health`);
        if (healthResponse.ok) {
            console.log('✅ Backend is running');
        } else {
            console.log('❌ Backend health check failed');
        }
    } catch (error) {
        console.log('❌ Backend is not running:', error.message);
        console.log('Please start the backend first with: mvn spring-boot:run');
        return;
    }
    
    try {
        // Test movies endpoint
        console.log('\n2. Testing movies endpoint...');
        const moviesResponse = await fetch(`${BASE_URL}/api/movies`);
        if (moviesResponse.ok) {
            const movies = await moviesResponse.json();
            console.log(`✅ Found ${movies.length} movies`);
            if (movies.length > 0) {
                console.log(`   First movie: ${movies[0].title} (ID: ${movies[0].id})`);
            }
        } else {
            console.log('❌ Movies endpoint failed');
        }
    } catch (error) {
        console.log('❌ Error fetching movies:', error.message);
    }
    
    try {
        // Test cinemas endpoint
        console.log('\n3. Testing cinemas endpoint...');
        const cinemasResponse = await fetch(`${BASE_URL}/api/cinemas`);
        if (cinemasResponse.ok) {
            const cinemas = await cinemasResponse.json();
            console.log(`✅ Found ${cinemas.length} cinemas`);
            if (cinemas.length > 0) {
                console.log(`   First cinema: ${cinemas[0].name} (ID: ${cinemas[0].id})`);
            }
        } else {
            console.log('❌ Cinemas endpoint failed');
        }
    } catch (error) {
        console.log('❌ Error fetching cinemas:', error.message);
    }
    
    try {
        // Test showtimes endpoint
        console.log('\n4. Testing showtimes endpoint...');
        const showtimesResponse = await fetch(`${BASE_URL}/api/showtimes`);
        if (showtimesResponse.ok) {
            const showtimes = await showtimesResponse.json();
            console.log(`✅ Found ${showtimes.length} showtimes`);
            if (showtimes.length > 0) {
                console.log(`   First showtime: Movie ID ${showtimes[0].movieId} at ${showtimes[0].startTime}`);
            }
        } else {
            console.log('❌ Showtimes endpoint failed');
        }
    } catch (error) {
        console.log('❌ Error fetching showtimes:', error.message);
    }
    
    try {
        // Test bookings endpoint
        console.log('\n5. Testing bookings endpoint...');
        const bookingsResponse = await fetch(`${BASE_URL}/api/booking`);
        if (bookingsResponse.ok) {
            const bookings = await bookingsResponse.json();
            console.log(`✅ Found ${bookings.length} bookings`);
        } else {
            console.log('❌ Bookings endpoint failed');
        }
    } catch (error) {
        console.log('❌ Error fetching bookings:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('If you see errors, the DataSeeder might not have run properly.');
    console.log('Try restarting the backend to trigger DataSeeder again.');
}

testDataSeeder().catch(console.error);

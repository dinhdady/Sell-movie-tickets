const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8080';

async function fixDataIssue() {
    console.log('🔧 Fixing Data Issue...\n');
    
    try {
        // Step 1: Check if backend is running
        console.log('1. Checking backend connection...');
        const healthResponse = await fetch(`${BASE_URL}/api/testing`);
        if (healthResponse.ok) {
            const result = await healthResponse.text();
            console.log('✅ Backend is running:', result);
        } else {
            console.log('❌ Backend is not running');
            return;
        }
    } catch (error) {
        console.log('❌ Backend is not running:', error.message);
        console.log('Please start the backend first with: mvn spring-boot:run');
        return;
    }
    
    try {
        // Step 2: Reset data
        console.log('\n2. Resetting data...');
        const resetResponse = await fetch(`${BASE_URL}/api/testing/reset-data`, {
            method: 'POST'
        });
        
        if (resetResponse.ok) {
            const result = await resetResponse.text();
            console.log('✅ Data reset result:', result);
        } else {
            console.log('❌ Data reset failed');
        }
    } catch (error) {
        console.log('❌ Error resetting data:', error.message);
    }
    
    try {
        // Step 3: Check data after reset
        console.log('\n3. Checking data after reset...');
        const checkResponse = await fetch(`${BASE_URL}/api/testing/check-data`);
        
        if (checkResponse.ok) {
            const result = await checkResponse.text();
            console.log('✅ Data check result:', result);
        } else {
            console.log('❌ Data check failed');
        }
    } catch (error) {
        console.log('❌ Error checking data:', error.message);
    }
    
    try {
        // Step 4: Test bookings endpoint
        console.log('\n4. Testing bookings endpoint...');
        const bookingsResponse = await fetch(`${BASE_URL}/api/booking`);
        
        if (bookingsResponse.ok) {
            const bookings = await bookingsResponse.json();
            console.log(`✅ Bookings endpoint working! Found ${bookings.length} bookings`);
        } else {
            const errorText = await bookingsResponse.text();
            console.log('❌ Bookings endpoint failed:', errorText);
        }
    } catch (error) {
        console.log('❌ Error testing bookings:', error.message);
    }
    
    try {
        // Step 5: Test movies endpoint
        console.log('\n5. Testing movies endpoint...');
        const moviesResponse = await fetch(`${BASE_URL}/api/movies`);
        
        if (moviesResponse.ok) {
            const movies = await moviesResponse.json();
            console.log(`✅ Movies endpoint working! Found ${movies.length} movies`);
            if (movies.length > 0) {
                console.log(`   First movie: ${movies[0].title} (ID: ${movies[0].id})`);
            }
        } else {
            console.log('❌ Movies endpoint failed');
        }
    } catch (error) {
        console.log('❌ Error testing movies:', error.message);
    }
    
    try {
        // Step 6: Test showtimes endpoint
        console.log('\n6. Testing showtimes endpoint...');
        const showtimesResponse = await fetch(`${BASE_URL}/api/showtimes`);
        
        if (showtimesResponse.ok) {
            const showtimes = await showtimesResponse.json();
            console.log(`✅ Showtimes endpoint working! Found ${showtimes.length} showtimes`);
            if (showtimes.length > 0) {
                console.log(`   First showtime: Movie ID ${showtimes[0].movieId} at ${showtimes[0].startTime}`);
            }
        } else {
            console.log('❌ Showtimes endpoint failed');
        }
    } catch (error) {
        console.log('❌ Error testing showtimes:', error.message);
    }
    
    console.log('\n🎉 Data fix completed!');
    console.log('If you still see errors, please check the backend logs for more details.');
}

fixDataIssue().catch(console.error);

// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:8080';

async function testBookingAPI() {
    console.log('🧪 Testing Booking API...\n');
    
    try {
        // Test 1: Check if backend is running
        console.log('1. Testing backend connection...');
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
        return;
    }
    
    try {
        // Test 2: Test bookings endpoint (should work without auth)
        console.log('\n2. Testing bookings endpoint...');
        const bookingsResponse = await fetch(`${BASE_URL}/api/booking`);
        
        if (bookingsResponse.ok) {
            const bookings = await bookingsResponse.json();
            console.log(`✅ Bookings endpoint working! Found ${bookings.length} bookings`);
            
            if (bookings.length > 0) {
                console.log('   First booking:', {
                    id: bookings[0].id,
                    customerName: bookings[0].customerName,
                    status: bookings[0].status
                });
            } else {
                console.log('   No bookings found - this is normal for a fresh system');
            }
        } else {
            const errorText = await bookingsResponse.text();
            console.log('❌ Bookings endpoint failed:', errorText);
        }
    } catch (error) {
        console.log('❌ Error testing bookings:', error.message);
    }
    
    try {
        // Test 3: Test showtimes endpoint
        console.log('\n3. Testing showtimes endpoint...');
        const showtimesResponse = await fetch(`${BASE_URL}/api/showtimes`);
        
        if (showtimesResponse.ok) {
            const showtimes = await showtimesResponse.json();
            console.log(`✅ Showtimes endpoint working! Found ${showtimes.length} showtimes`);
            
            if (showtimes.length > 0) {
                console.log('   First showtime:', {
                    id: showtimes[0].id,
                    movieId: showtimes[0].movieId,
                    startTime: showtimes[0].startTime
                });
            }
        } else {
            const errorText = await showtimesResponse.text();
            console.log('❌ Showtimes endpoint failed:', errorText);
        }
    } catch (error) {
        console.log('❌ Error testing showtimes:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('- If bookings endpoint works, the BookingManagement page should work');
    console.log('- If showtimes endpoint works, the data seeder created showtimes correctly');
    console.log('- If both work, the original error should be fixed');
}

testBookingAPI().catch(console.error);

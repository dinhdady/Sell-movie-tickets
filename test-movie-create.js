// Test script for movie creation API
const fetch = require('node-fetch');

const testMovieCreation = async () => {
  try {
    console.log('🧪 Testing Movie Creation API...\n');

    // Test data
    const movieData = {
      title: 'Test Movie',
      description: 'A test movie description',
      duration: 120,
      genre: 'Action',
      director: 'Test Director',
      language: 'Tiếng Việt',
      status: 'NOW_SHOWING',
      price: 100000,
      rating: 8.5,
      releaseDate: '2025-01-01',
      trailerUrl: 'https://youtube.com/watch?v=test',
      cast: 'Actor 1, Actor 2',
      filmRating: 'PG-13'
    };

    // Create FormData
    const formData = new FormData();
    Object.keys(movieData).forEach(key => {
      formData.append(key, movieData[key]);
    });

    console.log('📤 Sending request to /api/movie/add...');
    console.log('📋 Form data:', Object.fromEntries(formData.entries()));

    const response = await fetch('http://localhost:8080/api/movie/add', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    console.log('\n📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 Response Body:', responseText);

    if (response.ok) {
      console.log('\n✅ Movie creation successful!');
    } else {
      console.log('\n❌ Movie creation failed!');
    }

  } catch (error) {
    console.error('❌ Error testing movie creation:', error.message);
  }
};

// Run the test
testMovieCreation();

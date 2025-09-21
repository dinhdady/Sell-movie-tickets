// Test simple redirect endpoint
const testSimpleRedirect = async () => {
  console.log('🧪 Testing simple redirect...');
  
  try {
    const response = await fetch('http://localhost:8080/api/vnpay/test-simple', {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302) {
      const location = response.headers.get('Location');
      console.log('🔄 Redirect location:', location);
      
      if (location && location.includes('payment-callback')) {
        console.log('✅ Simple redirect works!');
      } else {
        console.log('❌ Simple redirect location is wrong:', location);
      }
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing simple redirect:', error);
  }
};

// Run the test
testSimpleRedirect();

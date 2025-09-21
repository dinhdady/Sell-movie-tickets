// Test VNPay return endpoint with full debug
const testVNPayReturnDebugFull = async () => {
  console.log('🧪 Testing VNPay return endpoint with full debug...');
  
  // Simple parameters
  const callbackParams = {
    vnp_ResponseCode: '00',
    vnp_TxnRef: 'test123',
    vnp_TransactionStatus: '00'
  };
  
  // Build query string
  const queryString = new URLSearchParams(callbackParams).toString();
  const callbackUrl = `http://localhost:8080/api/vnpay/return?${queryString}`;
  
  console.log('📞 Calling VNPay return URL:', callbackUrl);
  
  try {
    const response = await fetch(callbackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'manual'
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response statusText:', response.statusText);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check response body
    const text = await response.text();
    console.log('📄 Response body length:', text.length);
    console.log('📄 Response body:', text);
    
    // Check if response is ok
    console.log('📊 Response ok:', response.ok);
    console.log('📊 Response type:', response.type);
    console.log('📊 Response url:', response.url);
    
    if (response.status === 302) {
      const location = response.headers.get('Location');
      console.log('🔄 Redirect location:', location);
      
      if (location && location.includes('payment-callback')) {
        console.log('✅ Successfully redirected to frontend!');
        console.log('🎯 Frontend URL:', location);
      } else {
        console.log('❌ Redirect location is not correct:', location);
      }
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error calling VNPay return:', error);
  }
};

// Run the test
testVNPayReturnDebugFull();
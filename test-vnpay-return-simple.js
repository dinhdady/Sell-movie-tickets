// Test VNPay return endpoint with simple parameters
const testVNPayReturnSimple = async () => {
  console.log('🧪 Testing VNPay return endpoint with simple parameters...');
  
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
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302) {
      const location = response.headers.get('Location');
      console.log('🔄 Redirect location:', location);
      
      if (location && location.includes('payment-callback')) {
        console.log('✅ Successfully redirected to frontend!');
        console.log('🎯 Frontend URL:', location);
      } else {
        console.log('❌ Redirect location is not correct:', location);
      }
    } else if (response.status === 200) {
      const text = await response.text();
      console.log('📄 Response body:', text.substring(0, 500) + '...');
    } else {
      console.log('❌ Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error calling VNPay return:', error);
  }
};

// Run the test
testVNPayReturnSimple();

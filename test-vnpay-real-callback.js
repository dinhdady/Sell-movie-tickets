// Test VNPay real callback URL
const testVNPayRealCallback = async () => {
  console.log('🧪 Testing VNPay real callback URL...');
  
  // Real VNPay callback parameters
  const callbackParams = {
    vnp_Amount: '18000000',
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP15175274',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: 'Thanh toan don hang:38cb6d8',
    vnp_PayDate: '20250921123136',
    vnp_ResponseCode: '00',
    vnp_TmnCode: 'JGV9MSIF',
    vnp_TransactionNo: '15175274',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: '38cb6d8',
    vnp_SecureHash: 'fc86d0973369ea49a7c8cf90a0b6e1e25504953c26c9c4390bc9b6faeb6c6234a6facecfa1e9b4d2774ddb3a5e1f2e2de554d584477f725ee5121897f5c15895'
  };
  
  // Build query string
  const queryString = new URLSearchParams(callbackParams).toString();
  const callbackUrl = `http://localhost:8080/api/vnpay/return?${queryString}`;
  
  console.log('📞 Calling VNPay real callback URL:', callbackUrl);
  
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
    
    // Check response body
    const text = await response.text();
    console.log('📄 Response body length:', text.length);
    console.log('📄 Response body:', text);
    
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
    console.error('❌ Error calling VNPay real callback:', error);
  }
};

// Run the test
testVNPayRealCallback();

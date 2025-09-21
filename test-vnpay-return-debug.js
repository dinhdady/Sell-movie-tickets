// Test VNPay return endpoint with debug
const testVNPayReturn = async () => {
  console.log('🧪 Testing VNPay return endpoint...');
  
  // Simulate VNPay callback parameters
  const callbackParams = {
    vnp_Amount: '18000000',
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP15175272',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: 'Thanh toan don hang:34d4602',
    vnp_PayDate: '20250921122527',
    vnp_ResponseCode: '00',
    vnp_TmnCode: 'JGV9MSIF',
    vnp_TransactionNo: '15175272',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: '34d4602',
    vnp_SecureHash: '404d8db5b4479f6710c22be34a965d680d9e98981d9cf8e9dcb88af93b02ab10e1b2fd126e835afd291dbcbda49c1213f1437ad40ca97026749d2202e637992d'
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
testVNPayReturn();

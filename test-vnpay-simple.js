// Simple test for VNPay callback
console.log('🧪 Testing VNPay Callback...\n');

// Test 1: Test callback endpoint
console.log('1️⃣ Testing /api/vnpay/test-callback...');
fetch('http://localhost:8080/api/vnpay/test-callback?txnRef=test123')
  .then(response => {
    console.log('Status:', response.status);
    console.log('Redirected:', response.redirected);
    if (response.redirected) {
      console.log('✅ Redirected to:', response.url);
    }
    return response.text();
  })
  .then(text => {
    console.log('Response length:', text.length);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });

// Test 2: Test direct frontend callback
console.log('\n2️⃣ Testing direct frontend callback...');
fetch('http://localhost:5173/payment-callback?status=success&txnRef=test123')
  .then(response => {
    console.log('Status:', response.status);
    console.log('Redirected:', response.redirected);
    if (response.redirected) {
      console.log('✅ Redirected to:', response.url);
    }
    return response.text();
  })
  .then(text => {
    console.log('Response length:', text.length);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });

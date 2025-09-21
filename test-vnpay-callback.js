// Use built-in fetch (Node.js 18+)

async function testVnpayCallback() {
    console.log('🧪 Testing VNPay Callback...\n');
    
    try {
        // Test 1: Test callback endpoint
        console.log('1️⃣ Testing /api/vnpay/test-callback...');
        const testResponse = await fetch('http://localhost:8080/api/vnpay/test-callback?txnRef=test123');
        console.log('Status:', testResponse.status);
        console.log('Headers:', Object.fromEntries(testResponse.headers.entries()));
        
        if (testResponse.redirected) {
            console.log('✅ Redirected to:', testResponse.url);
        } else {
            const text = await testResponse.text();
            console.log('Response:', text);
        }
        
        console.log('\n2️⃣ Testing /api/vnpay/return with mock VNPay params...');
        
        // Simulate VNPay callback with success parameters
        const mockVnpayParams = new URLSearchParams({
            'vnp_Amount': '18000000',
            'vnp_BankCode': 'NCB',
            'vnp_BankTranNo': 'VNP123456789',
            'vnp_CardType': 'ATM',
            'vnp_OrderInfo': 'Thanh toan don hang:test123',
            'vnp_PayDate': '20250921004949',
            'vnp_ResponseCode': '00',
            'vnp_TmnCode': 'JGV9MSIF',
            'vnp_TransactionNo': '1234567890',
            'vnp_TransactionStatus': '00',
            'vnp_TxnRef': 'test123',
            'vnp_SecureHash': 'test_hash'
        });
        
        const returnResponse = await fetch(`http://localhost:8080/api/vnpay/return?${mockVnpayParams.toString()}`);
        console.log('Status:', returnResponse.status);
        console.log('Headers:', Object.fromEntries(returnResponse.headers.entries()));
        
        if (returnResponse.redirected) {
            console.log('✅ Redirected to:', returnResponse.url);
        } else {
            const text = await returnResponse.text();
            console.log('Response:', text);
        }
        
        console.log('\n3️⃣ Testing direct frontend callback...');
        const frontendResponse = await fetch('http://localhost:5173/payment-callback?status=success&txnRef=test123');
        console.log('Status:', frontendResponse.status);
        
        if (frontendResponse.redirected) {
            console.log('✅ Redirected to:', frontendResponse.url);
        } else {
            const text = await frontendResponse.text();
            console.log('Response length:', text.length);
        }
        
    } catch (error) {
        console.error('❌ Error testing VNPay callback:', error.message);
    }
}

testVnpayCallback();

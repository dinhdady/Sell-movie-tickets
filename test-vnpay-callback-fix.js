// Test VNPay callback fix
console.log("🔧 Testing VNPay callback fix...");

// Test 1: Check if /api/home returns JSON instead of template
fetch('http://localhost:8080/api/home')
    .then(response => response.text())
    .then(data => {
        console.log("✅ /api/home response:", data.substring(0, 200) + "...");
    })
    .catch(error => {
        console.log("❌ /api/home error:", error.message);
    });

// Test 2: Check if /api/vnpay/return works
const testParams = new URLSearchParams({
    'vnp_Amount': '18000000',
    'vnp_BankCode': 'NCB',
    'vnp_BankTranNo': 'VNP15175106',
    'vnp_CardType': 'ATM',
    'vnp_OrderInfo': 'Thanh toan don hang:566db34',
    'vnp_PayDate': '20250921005818',
    'vnp_ResponseCode': '00',
    'vnp_TmnCode': 'JGV9MSIF',
    'vnp_TransactionNo': '15175106',
    'vnp_TransactionStatus': '00',
    'vnp_TxnRef': '566db34',
    'vnp_SecureHash': 'f5e7c8ec0776954676e6bfc7f88ba642f0132b7100c1e62336c626bf6ce8f935cd67483a39e6fb7941df351126593cc053404c724a0a43bdf2224490a07d04e0'
});

fetch(`http://localhost:8080/api/vnpay/return?${testParams}`)
    .then(response => {
        console.log("✅ /api/vnpay/return status:", response.status);
        console.log("✅ /api/vnpay/return headers:", response.headers.get('location'));
        return response.text();
    })
    .then(data => {
        console.log("✅ /api/vnpay/return response:", data.substring(0, 200) + "...");
    })
    .catch(error => {
        console.log("❌ /api/vnpay/return error:", error.message);
    });

// Test 3: Check if there are any other endpoints that might be called
const endpoints = [
    '/api/home',
    '/api/vnpay/return',
    '/api/vnpay/test-callback',
    '/api/movie/now-showing',
    '/api/booking/all'
];

endpoints.forEach(endpoint => {
    fetch(`http://localhost:8080${endpoint}`)
        .then(response => {
            console.log(`✅ ${endpoint} - Status: ${response.status}`);
        })
        .catch(error => {
            console.log(`❌ ${endpoint} - Error: ${error.message}`);
        });
});

console.log("🔧 Test completed!");

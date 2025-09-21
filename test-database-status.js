// Test database status column
const testDatabaseStatus = async () => {
  console.log('🧪 Testing database status column...');
  
  try {
    const response = await fetch('http://localhost:8080/api/vnpay/test-database-status', {
      method: 'GET'
    });
    
    const data = await response.json();
    console.log('📊 Response:', data);
    
    if (response.ok) {
      console.log('✅ Database status test endpoint works');
    } else {
      console.log('❌ Database status test failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Error testing database status:', error);
  }
};

// Run the test
testDatabaseStatus();

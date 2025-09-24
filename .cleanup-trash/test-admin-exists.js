// Test if admin user exists and try to login
// Run this in the browser console

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login\n');
  
  const credentials = [
    { email: 'admin@example.com', password: 'Admin123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@example.com', password: 'Admin@123' },
    { email: 'admin@example.com', password: 'password' }
  ];
  
  for (const cred of credentials) {
    console.log(`Testing: ${cred.email} / ${cred.password}`);
    
    try {
      const response = await fetch('http://localhost:5295/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cred)
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        console.log('✅ SUCCESS! Use this password:', cred.password);
        console.log('Token:', data.token.substring(0, 30) + '...');
        console.log('User:', data.email, data.role);
        
        // Save to localStorage
        localStorage.setItem('auth', JSON.stringify(data));
        console.log('\nAuth saved to localStorage. You can now run other commands.');
        return true;
      } else {
        console.log('❌ Failed:', data.message || response.statusText);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n⚠️  No working credentials found!');
  console.log('Possible issues:');
  console.log('1. Database might be empty - data seeder needs to run');
  console.log('2. Backend might not be running on port 5295');
  console.log('3. CORS might be blocking the request');
  
  // Test backend connectivity
  try {
    const test = await fetch('http://localhost:5295/api/auth/login', {
      method: 'GET'
    });
    console.log('\nBackend is reachable, status:', test.status);
  } catch (e) {
    console.log('\n❌ Cannot reach backend at http://localhost:5295');
  }
}

// Run the test
testAdminLogin();
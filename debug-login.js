// Debug script for login issues
// Run this in the browser console on the login page

async function debugLogin() {
  console.log('🔍 Debugging Login Issues');
  console.log('========================\n');
  
  // 1. Check API connectivity
  console.log('1. Checking API connectivity...');
  try {
    const response = await fetch('http://localhost:5295/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });
    
    console.log('   API Response Status:', response.status);
    console.log('   API is reachable:', response.status !== 0);
    
    if (response.status === 0) {
      console.error('   ❌ API is not reachable. Is the backend running?');
    } else {
      console.log('   ✅ API is reachable');
    }
  } catch (error) {
    console.error('   ❌ Failed to reach API:', error.message);
  }
  
  // 2. Test each credential
  console.log('\n2. Testing demo credentials...');
  const credentials = [
    { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
    { email: 'instructor@example.com', password: 'instructor123', role: 'Instructor' },
    { email: 'student@example.com', password: 'student123', role: 'Student' }
  ];
  
  for (const cred of credentials) {
    console.log(`\n   Testing ${cred.role}:`);
    try {
      const response = await fetch('http://localhost:5295/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cred.email,
          password: cred.password
        })
      });
      
      const responseText = await response.text();
      console.log(`   - Status: ${response.status}`);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log(`   ✅ Login successful!`);
        console.log(`   - Token: ${data.token ? 'Present' : 'Missing'}`);
        console.log(`   - User ID: ${data.userId || 'N/A'}`);
        console.log(`   - Role: ${data.role || 'N/A'}`);
      } else {
        console.log(`   ❌ Login failed`);
        console.log(`   - Error: ${responseText}`);
      }
    } catch (error) {
      console.error(`   ❌ Request failed:`, error.message);
    }
  }
  
  // 3. Check environment variables
  console.log('\n3. Environment Configuration:');
  console.log('   VITE_API_URL:', import.meta?.env?.VITE_API_URL || 'Not set');
  console.log('   API_BASE_URL in code:', window.API_BASE_URL || 'Not found');
  
  // 4. Check localStorage
  console.log('\n4. LocalStorage Check:');
  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const authData = JSON.parse(auth);
      console.log('   Existing auth found:', authData.email);
      console.log('   Role:', authData.role);
    } catch (e) {
      console.log('   Invalid auth data in localStorage');
    }
  } else {
    console.log('   No existing auth in localStorage');
  }
  
  // 5. Manual login test
  console.log('\n5. To manually test login:');
  console.log('   Run: testLogin("admin@example.com", "admin123")');
}

// Helper function for manual testing
window.testLogin = async function(email, password) {
  console.log(`\nTesting login for ${email}...`);
  
  try {
    const response = await fetch('http://localhost:5295/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token);
      console.log('User:', data);
      
      // Store in localStorage like the app does
      localStorage.setItem('auth', JSON.stringify({
        token: data.token,
        refreshToken: data.refreshToken,
        id: data.userId,
        email: email,
        fullName: data.fullName,
        role: data.role,
        accessToken: data.token
      }));
      
      console.log('\nAuth saved to localStorage. You can now reload the page.');
    } else {
      console.error('❌ Login failed:', data);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
};

// Run the debug
debugLogin();
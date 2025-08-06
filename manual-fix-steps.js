// Manual steps to fix Dr. Sarah Johnson's data
// Run these commands one by one in the browser console

// Step 1: Login as admin first
async function loginAsAdmin() {
  const response = await fetch('http://localhost:5295/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'Admin123'
    })
  });
  
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('auth', JSON.stringify(data));
    console.log('✅ Logged in as admin');
    return data.token;
  } else {
    console.error('❌ Login failed');
    return null;
  }
}

// Step 2: Verify current instructor data
async function verifyInstructorData(token) {
  console.log('\n📊 Current instructor data:');
  const response = await fetch('http://localhost:5295/api/admin/verify-instructor-data', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  data.forEach(instructor => {
    console.log(`\n${instructor.name} (${instructor.email}):`);
    console.log(`  Courses: ${instructor.totalCourses}`);
    console.log(`  Enrollments: ${instructor.totalEnrollments}`);
    console.log(`  Payments: ${instructor.totalPayments}`);
    console.log(`  Revenue: $${instructor.totalRevenue}`);
    console.log(`  Rating: ${instructor.averageRating.toFixed(2)}`);
  });
  return data;
}

// Step 3: Re-run data seeder
async function reseedData(token) {
  console.log('\n🌱 Re-running data seeder...');
  const response = await fetch('http://localhost:5295/api/admin/seed', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  console.log(data.message || 'Seeding completed');
}

// Step 4: Fix payment records
async function fixPayments(token) {
  console.log('\n💰 Fixing payment records...');
  const response = await fetch('http://localhost:5295/api/admin/fix-instructor-payments', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  console.log(data.message || 'Payments fixed');
  
  if (data.summary) {
    console.log('\n✅ Updated instructor data:');
    data.summary.forEach(instructor => {
      console.log(`\n${instructor.name} (${instructor.email}):`);
      console.log(`  Revenue: $${instructor.totalRevenue}`);
      console.log(`  Creator Earnings (80%): $${(instructor.totalRevenue * 0.8).toFixed(2)}`);
      console.log(`  Platform Share (20%): $${(instructor.totalRevenue * 0.2).toFixed(2)}`);
    });
  }
}

// Run all fixes
async function runAllFixes() {
  console.log('🚀 Starting Dr. Sarah Johnson data fix...\n');
  
  // Step 1: Login
  const token = await loginAsAdmin();
  if (!token) return;
  
  // Step 2: Show current data
  await verifyInstructorData(token);
  
  // Step 3: Re-seed data
  await reseedData(token);
  
  // Step 4: Fix payments
  await fixPayments(token);
  
  console.log('\n✅ All fixes completed! Refreshing page...');
  setTimeout(() => location.reload(), 2000);
}

// Instructions
console.log('🔧 Dr. Sarah Johnson Data Fix Tool');
console.log('==================================');
console.log('To fix the data, run: runAllFixes()');
console.log('Or run individual steps:');
console.log('1. const token = await loginAsAdmin()');
console.log('2. await verifyInstructorData(token)');
console.log('3. await reseedData(token)');
console.log('4. await fixPayments(token)');
console.log('\nType runAllFixes() and press Enter to start.');
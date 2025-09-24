// Final test to verify instructor data displays correctly
// Run this in browser console on marketplace page

async function finalInstructorTest() {
  console.log('🎯 Final Instructor Data Test');
  console.log('============================\n');
  
  // Get auth token
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!auth.token) {
    console.error('❌ Not logged in! Please login first.');
    return;
  }
  
  // Test the analytics endpoint
  const response = await fetch('http://localhost:5295/api/analytics/platform', {
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    console.error('❌ Failed to fetch analytics:', response.status);
    return;
  }
  
  const data = await response.json();
  console.log('✅ Platform Analytics Response:');
  console.log('Total Revenue:', data.summary?.totalRevenue);
  console.log('Top Performers:', data.topPerformers?.length || 0);
  
  if (data.topPerformers?.length > 0) {
    console.log('\n📊 Instructor Data from Backend:');
    data.topPerformers.forEach((performer, index) => {
      console.log(`\n${index + 1}. ${performer.instructorName}`);
      console.log('   Raw data from backend:');
      console.log('   - totalRevenue:', performer.totalRevenue, `(type: ${typeof performer.totalRevenue})`);
      console.log('   - totalStudents:', performer.totalStudents);
      console.log('   - totalCourses:', performer.totalCourses);
      console.log('   - averageRating:', performer.averageRating);
      
      console.log('\n   Expected display values:');
      console.log('   - Total Revenue:', `₱${performer.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log('   - Creator Earnings (80%):', `₱${(performer.totalRevenue * 0.8).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log('   - Platform Share (20%):', `₱${(performer.totalRevenue * 0.2).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      console.log('   - Rating:', performer.averageRating.toFixed(2));
    });
  }
  
  // Check DOM elements
  console.log('\n🔍 Checking Page Display:');
  
  // Navigate to Instructors tab
  const instructorsTab = document.querySelector('[data-value="instructors"]');
  if (instructorsTab) {
    instructorsTab.click();
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check displayed values
    const creatorEarningsElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent?.includes('Creator Earnings')
    );
    
    console.log(`Found ${creatorEarningsElements.length} Creator Earnings elements`);
    
    // Check first instructor card
    const firstCard = document.querySelector('.shadow-card');
    if (firstCard) {
      console.log('\n✅ First Instructor Card Content:');
      const nameEl = firstCard.querySelector('.text-xl.font-bold');
      console.log('Name:', nameEl?.textContent);
      
      // Find revenue displays
      const revenueEls = firstCard.querySelectorAll('.text-xl.font-bold');
      revenueEls.forEach(el => {
        if (el.textContent?.includes('₱')) {
          const label = el.parentElement?.querySelector('.text-xs')?.textContent;
          console.log(`${label}:`, el.textContent);
        }
      });
      
      // Find rating
      const ratingEl = Array.from(firstCard.querySelectorAll('*')).find(el => 
        el.textContent?.match(/^\d+\.\d{2}$/) && parseFloat(el.textContent) <= 5
      );
      if (ratingEl) {
        console.log('Rating:', ratingEl.textContent);
      }
    }
  }
  
  console.log('\n✅ Test Complete!');
  console.log('If values are not displaying correctly, check:');
  console.log('1. Backend is returning numeric values (not strings)');
  console.log('2. Frontend is using formatPHP() for currency display');
  console.log('3. Frontend is using formatRating() for rating display');
}

// Run the test
finalInstructorTest();
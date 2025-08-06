// Script to verify Dr. Sarah Johnson's specific data
// Run this in the browser console while on the marketplace page

async function verifySarahJohnsonData() {
  console.log('🔍 Verifying Dr. Sarah Johnson Data');
  console.log('==================================\n');
  
  // Get auth token
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  if (!auth.token) {
    console.error('❌ Not logged in! Please login first.');
    return;
  }
  
  // 1. Get platform analytics to find Sarah's data
  console.log('1. Fetching Platform Analytics...');
  try {
    const response = await fetch('http://localhost:5295/api/analytics/platform', {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Find Dr. Sarah Johnson
      const sarah = data.topPerformers?.find(p => 
        p.instructorName === 'Dr. Sarah Johnson' || 
        p.instructorName.includes('Sarah')
      );
      
      if (sarah) {
        console.log('✅ Found Dr. Sarah Johnson in analytics:');
        console.log('   - Instructor ID:', sarah.instructorId);
        console.log('   - Total Revenue:', sarah.totalRevenue);
        console.log('   - Total Students:', sarah.totalStudents);
        console.log('   - Total Courses:', sarah.totalCourses);
        console.log('   - Average Rating:', sarah.averageRating);
        console.log('\n   Calculated values:');
        console.log('   - Creator Earnings (80%):', sarah.totalRevenue * 0.8);
        console.log('   - Platform Share (20%):', sarah.totalRevenue * 0.2);
        
        // 2. Fetch her courses directly
        console.log('\n2. Fetching Dr. Sarah Johnson\'s courses...');
        const coursesResponse = await fetch(`http://localhost:5295/api/courses?instructorId=${sarah.instructorId}`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json();
          console.log(`\n✅ Found ${courses.length} courses for Dr. Sarah Johnson:`);
          
          let totalStudentsFromCourses = 0;
          let totalRevenueFromCourses = 0;
          
          courses.forEach((course, index) => {
            const students = course.studentsCount || course.students || 0;
            const price = course.price || 0;
            const courseRevenue = students * price;
            
            totalStudentsFromCourses += students;
            totalRevenueFromCourses += courseRevenue;
            
            console.log(`\n   ${index + 1}. ${course.title}`);
            console.log(`      - Price: $${price}`);
            console.log(`      - Students: ${students}`);
            console.log(`      - Course Revenue: $${courseRevenue.toFixed(2)}`);
            console.log(`      - Rating: ${course.averageRating || course.rating || 'N/A'}`);
          });
          
          console.log('\n   📊 Calculated Totals from Courses:');
          console.log(`   - Total Students: ${totalStudentsFromCourses}`);
          console.log(`   - Total Revenue: $${totalRevenueFromCourses.toFixed(2)}`);
          console.log(`   - Creator Earnings (80%): $${(totalRevenueFromCourses * 0.8).toFixed(2)}`);
          console.log(`   - Platform Share (20%): $${(totalRevenueFromCourses * 0.2).toFixed(2)}`);
          
          if (sarah.totalRevenue !== totalRevenueFromCourses) {
            console.log('\n⚠️  Revenue mismatch!');
            console.log(`   Analytics shows: $${sarah.totalRevenue}`);
            console.log(`   Calculated from courses: $${totalRevenueFromCourses.toFixed(2)}`);
            console.log('   This indicates revenue is based on actual payments, not course price × students');
          }
        }
        
        // 3. Check if she's the logged-in instructor
        if (auth.email === 'instructor@example.com') {
          console.log('\n3. Fetching instructor-specific analytics...');
          const instructorAnalytics = await fetch(`http://localhost:5295/api/analytics/instructor/${sarah.instructorId}`, {
            headers: {
              'Authorization': `Bearer ${auth.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (instructorAnalytics.ok) {
            const instructorData = await instructorAnalytics.json();
            console.log('✅ Instructor Analytics:');
            console.log('   - Total Revenue:', instructorData.summary?.totalRevenue);
            console.log('   - Total Students:', instructorData.summary?.totalStudents);
            console.log('   - Average Rating:', instructorData.summary?.averageRating);
          }
        }
      } else {
        console.log('❌ Dr. Sarah Johnson not found in top performers!');
        console.log('   Available instructors:', data.topPerformers?.map(p => p.instructorName).join(', '));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // 4. Check the page display
  console.log('\n4. Checking page display...');
  const instructorsTab = document.querySelector('[data-value="instructors"]');
  if (instructorsTab) {
    instructorsTab.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find Sarah's card
    const cards = document.querySelectorAll('.shadow-card');
    let sarahCard = null;
    
    cards.forEach(card => {
      const nameEl = card.querySelector('.text-xl.font-bold');
      if (nameEl?.textContent?.includes('Sarah')) {
        sarahCard = card;
      }
    });
    
    if (sarahCard) {
      console.log('✅ Found Dr. Sarah Johnson\'s card on the page');
      
      // Extract displayed values
      const creatorEarningsEl = Array.from(sarahCard.querySelectorAll('.text-center')).find(el => 
        el.textContent?.includes('Creator Earnings')
      );
      
      if (creatorEarningsEl) {
        const value = creatorEarningsEl.querySelector('.text-xl.font-bold')?.textContent;
        console.log('   Displayed Creator Earnings:', value);
      }
    }
  }
  
  console.log('\n📌 Key Issue: The backend calculates revenue from actual Payment records,');
  console.log('   not from course price × enrolled students. If there are no payment');
  console.log('   records for Dr. Sarah Johnson\'s courses, her revenue will show as 0.');
}

// Run the verification
verifySarahJohnsonData();
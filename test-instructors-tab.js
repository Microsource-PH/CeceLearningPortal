// Test script to debug and verify instructors tab
// Run this in the browser console on the marketplace page

async function testInstructorsTab() {
  console.log('🔍 Testing Instructors Tab');
  console.log('=========================\n');
  
  // 1. Check if tab exists and click it
  const instructorsTab = document.querySelector('[value="instructors"]');
  if (instructorsTab) {
    console.log('✅ Instructors tab found');
    instructorsTab.click();
    
    // Wait for tab to load
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    console.error('❌ Instructors tab not found');
    return;
  }
  
  // 2. Check tab content
  const tabPanel = document.querySelector('[role="tabpanel"][data-state="active"]');
  console.log('\nActive tab panel:', tabPanel?.getAttribute('value'));
  
  // 3. Check for instructors content
  const noInstructorsMsg = document.querySelector('p:contains("No instructors found")');
  const instructorCards = document.querySelectorAll('[class*="instructor"]');
  
  console.log('\nInstructors content:');
  console.log('- No instructors message:', !!noInstructorsMsg);
  console.log('- Instructor cards found:', instructorCards.length);
  
  // 4. Test API call
  console.log('\n📡 Testing Analytics API:');
  try {
    const response = await fetch('http://localhost:5295/api/analytics/platform', {
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Platform analytics response:', data);
      console.log('- Top performers:', data.topPerformers?.length || 0);
      
      if (data.topPerformers?.length > 0) {
        console.log('\nTop Performers:');
        data.topPerformers.forEach((performer, index) => {
          console.log(`${index + 1}. ${performer.instructorName}`);
          console.log(`   - Total Revenue: ${performer.totalRevenue}`);
          console.log(`   - Total Students: ${performer.totalStudents}`);
          console.log(`   - Total Courses: ${performer.totalCourses}`);
        });
      }
    } else {
      console.error('❌ API call failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error calling API:', error);
  }
  
  // 5. Check localStorage courses
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  const instructorMap = new Map();
  
  courses.forEach(course => {
    const instructorName = course.instructorName || course.instructor || 'Unknown';
    if (!instructorMap.has(instructorName)) {
      instructorMap.set(instructorName, { count: 0, revenue: 0 });
    }
    const data = instructorMap.get(instructorName);
    data.count++;
    data.revenue += (course.price || 0) * (course.studentsCount || course.students || 0);
  });
  
  console.log('\n📚 Courses by Instructor (from localStorage):');
  instructorMap.forEach((data, name) => {
    console.log(`- ${name}: ${data.count} courses, ₱${data.revenue.toFixed(2)} total revenue`);
  });
  
  // 6. Check for currency formatting
  console.log('\n💰 Currency Formatting Check:');
  const revenueElements = document.querySelectorAll('*:contains("₱")');
  let formattingIssues = 0;
  
  revenueElements.forEach(el => {
    const text = el.textContent;
    const matches = text.match(/₱[\d,]+(\.\d+)?/g);
    if (matches) {
      matches.forEach(match => {
        if (!match.includes('.') || !match.match(/\.\d{2}$/)) {
          console.warn(`⚠️ Improper formatting: "${match}"`);
          formattingIssues++;
        }
      });
    }
  });
  
  if (formattingIssues === 0) {
    console.log('✅ All currency values properly formatted with 2 decimal places');
  } else {
    console.log(`❌ Found ${formattingIssues} formatting issues`);
  }
  
  console.log('\n📊 Summary:');
  console.log('- Instructors tab is', instructorsTab ? 'visible' : 'missing');
  console.log('- Content is', instructorCards.length > 0 ? 'displaying' : 'not displaying');
  console.log('- API connection is', 'tested above');
  console.log('- Currency formatting is', formattingIssues === 0 ? 'correct' : 'needs fixing');
}

// Run the test
testInstructorsTab();
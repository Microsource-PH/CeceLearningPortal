// Debug script to check instructors tab
// Run this in the browser console

function debugInstructors() {
  console.log('Debugging Instructors Tab');
  console.log('=========================\n');
  
  // 1. Check if the tab exists
  const instructorsTab = document.querySelector('[value="instructors"]');
  console.log('1. Instructors Tab Element:', instructorsTab ? 'Found' : 'Not Found');
  
  if (instructorsTab) {
    console.log('   Tab Text:', instructorsTab.textContent);
    console.log('   Tab State:', instructorsTab.getAttribute('data-state'));
  }
  
  // 2. Check tab content
  const instructorsContent = document.querySelector('[value="instructors"][role="tabpanel"]');
  console.log('\n2. Instructors Content Panel:', instructorsContent ? 'Found' : 'Not Found');
  
  if (instructorsContent) {
    console.log('   Content HTML length:', instructorsContent.innerHTML.length);
    console.log('   Has "No instructors" message:', instructorsContent.textContent.includes('No instructors found'));
    console.log('   Has loading spinner:', instructorsContent.querySelector('.animate-spin') ? 'Yes' : 'No');
  }
  
  // 3. Check localStorage for courses
  const courses = JSON.parse(localStorage.getItem('courses') || '[]');
  console.log('\n3. Courses in localStorage:', courses.length);
  
  // 4. Check unique instructors
  const instructorNames = new Set();
  const instructorIds = new Set();
  
  courses.forEach(course => {
    if (course.instructorName || course.instructor) {
      instructorNames.add(course.instructorName || course.instructor);
    }
    if (course.instructorId || course.instructor_id) {
      instructorIds.add(course.instructorId || course.instructor_id);
    }
  });
  
  console.log('\n4. Unique Instructors:');
  console.log('   By Name:', Array.from(instructorNames));
  console.log('   By ID:', Array.from(instructorIds));
  
  // 5. Check React DevTools (if available)
  console.log('\n5. To check React state:');
  console.log('   1. Open React DevTools');
  console.log('   2. Search for "Marketplace" component');
  console.log('   3. Check the "instructors" state array');
  console.log('   4. Check the "loading" state');
  
  // 6. Try clicking the tab
  console.log('\n6. Attempting to click Instructors tab...');
  if (instructorsTab) {
    instructorsTab.click();
    setTimeout(() => {
      const activePanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      console.log('   Active panel after click:', activePanel?.getAttribute('value') || 'none');
    }, 500);
  }
}

// Run the debug function
debugInstructors();
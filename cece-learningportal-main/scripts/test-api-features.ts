// Test if the API is returning features correctly
async function testAPIFeatures() {
  try {
    // Test marketplace endpoint
    console.log('Testing /api/marketplace/courses endpoint...');
    const marketplaceResponse = await fetch('http://localhost:5295/api/marketplace/courses');
    console.log('Response status:', marketplaceResponse.status);
    const responseText = await marketplaceResponse.text();
    console.log('Response text:', responseText);
    
    if (!responseText) {
      console.log('Empty response - server might still be starting');
      return;
    }
    
    const marketplaceCourses = JSON.parse(responseText);
    
    console.log('\nMarketplace courses:', marketplaceCourses.length);
    if (marketplaceCourses.length > 0) {
      const firstCourse = marketplaceCourses[0];
      console.log('\nFirst course:');
      console.log('- Title:', firstCourse.title);
      console.log('- Features:', firstCourse.features);
      console.log('- Tags:', firstCourse.tags);
      console.log('- Course Type:', firstCourse.courseType);
      console.log('- Is Bestseller:', firstCourse.isBestseller);
    }
    
    // Test regular courses endpoint
    console.log('\n\nTesting /api/courses endpoint...');
    const coursesResponse = await fetch('http://localhost:5295/api/courses');
    const courses = await coursesResponse.json();
    
    console.log('Regular courses:', courses.length);
    if (courses.length > 0) {
      const firstCourse = courses[0];
      console.log('\nFirst course:');
      console.log('- Title:', firstCourse.title);
      console.log('- Features:', firstCourse.features);
      console.log('- Course Type:', firstCourse.courseType);
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testAPIFeatures();
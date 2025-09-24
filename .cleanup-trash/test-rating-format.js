// Test script to verify all ratings display with 2 decimal places
// Run this in the browser console

function testRatingFormat() {
  console.log('🌟 Testing Rating Format (2 decimal places)');
  console.log('==========================================\n');
  
  // Find all elements that might contain ratings
  const allElements = document.querySelectorAll('*');
  const ratingRegex = /\b\d+\.?\d*\b/g; // Matches numbers
  const starElements = [];
  const issues = [];
  
  // Find elements near star icons (likely ratings)
  allElements.forEach(el => {
    if (el.querySelector('[class*="star"]') || el.innerHTML.includes('Star')) {
      const parent = el.parentElement;
      if (parent && parent.textContent.match(ratingRegex)) {
        starElements.push(parent);
      }
    }
  });
  
  console.log(`Found ${starElements.length} elements with star icons and numbers\n`);
  
  // Check each potential rating
  starElements.forEach(el => {
    const text = el.textContent;
    const numbers = text.match(ratingRegex);
    
    if (numbers) {
      numbers.forEach(num => {
        const numFloat = parseFloat(num);
        // Check if it's likely a rating (between 0 and 5)
        if (numFloat >= 0 && numFloat <= 5 && !Number.isInteger(numFloat)) {
          // Check decimal places
          const decimalPart = num.split('.')[1];
          if (!decimalPart || decimalPart.length !== 2) {
            issues.push({
              element: el,
              value: num,
              text: text.trim().substring(0, 50) + '...'
            });
          }
        }
      });
    }
  });
  
  // Also check for specific rating patterns
  const ratingPatterns = [
    /rating[:\s]+(\d+\.?\d*)/gi,
    /★\s*(\d+\.?\d*)/g,
    /⭐\s*(\d+\.?\d*)/g,
    /Rating.*?(\d+\.?\d*)/gi
  ];
  
  allElements.forEach(el => {
    const text = el.textContent;
    ratingPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const rating = match[1];
        if (rating && !rating.includes('.')) {
          // Integer rating, check if it should have decimals
          console.log(`ℹ️  Integer rating found: ${rating} in "${text.trim().substring(0, 40)}..."`);
        } else if (rating) {
          const decimalPart = rating.split('.')[1];
          if (decimalPart && decimalPart.length !== 2) {
            issues.push({
              element: el,
              value: rating,
              text: text.trim().substring(0, 50) + '...'
            });
          }
        }
      }
    });
  });
  
  // Report findings
  if (issues.length === 0) {
    console.log('✅ All ratings appear to be formatted correctly with 2 decimal places!');
  } else {
    console.log(`❌ Found ${issues.length} ratings not formatted with 2 decimal places:\n`);
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. Value: "${issue.value}"`);
      console.log(`   Context: ${issue.text}`);
      console.log(`   Element:`, issue.element);
      console.log('');
    });
  }
  
  // Test the formatRating function if available
  console.log('\n📝 Testing formatRating function:');
  if (window.formatRating || window.__APP_CONTEXT__?.formatRating) {
    const formatRating = window.formatRating || window.__APP_CONTEXT__.formatRating;
    const testCases = [
      4.5, 4.567, 4, 0, 3.1, 4.99, 5
    ];
    
    testCases.forEach(value => {
      const result = formatRating(value);
      console.log(`formatRating(${value}) = "${result}"`);
    });
  } else {
    console.log('⚠️  formatRating function not found in window context');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`- Total potential rating elements checked: ${starElements.length}`);
  console.log(`- Formatting issues found: ${issues.length}`);
  console.log(`- Recommendation: ${issues.length > 0 ? 'Fix the ratings listed above' : 'All ratings properly formatted!'}`);
}

// Run the test
testRatingFormat();
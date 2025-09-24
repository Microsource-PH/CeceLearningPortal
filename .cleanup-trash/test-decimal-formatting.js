// Test script to verify all monetary values display with 2 decimal places
// Run this in the browser console

function testDecimalFormatting() {
  console.log('Testing Decimal Formatting for Monetary Values');
  console.log('==============================================\n');
  
  // Test 1: Check all elements with ₱ symbol
  const phpElements = document.querySelectorAll('*');
  const moneyRegex = /₱[\d,]+(\.\d+)?/g;
  let issues = [];
  
  phpElements.forEach(element => {
    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
      const text = element.textContent;
      const matches = text.match(moneyRegex);
      
      if (matches) {
        matches.forEach(match => {
          // Check if it has exactly 2 decimal places
          const parts = match.split('.');
          if (parts.length === 1 || (parts.length === 2 && parts[1].length !== 2)) {
            issues.push({
              element: element,
              text: match,
              location: element.className || element.tagName
            });
          }
        });
      }
    }
  });
  
  if (issues.length > 0) {
    console.log('❌ Found monetary values without proper 2 decimal formatting:');
    issues.forEach(issue => {
      console.log(`   - "${issue.text}" in ${issue.location}`);
    });
  } else {
    console.log('✅ All monetary values are properly formatted with 2 decimal places');
  }
  
  // Test 2: Check formatPHP function
  console.log('\n\nTesting formatPHP function:');
  console.log('===========================');
  
  // Import the function if available in window
  if (window.formatPHP || window.__APP_CONTEXT__?.formatPHP) {
    const formatPHP = window.formatPHP || window.__APP_CONTEXT__.formatPHP;
    
    const testCases = [
      { input: 0, expected: '₱0.00' },
      { input: 100, expected: '₱100.00' },
      { input: 1234.5, expected: '₱1,234.50' },
      { input: 1234.567, expected: '₱1,234.57' },
      { input: 1234567.89, expected: '₱1,234,567.89' }
    ];
    
    testCases.forEach(test => {
      const result = formatPHP(test.input);
      const passed = result === test.expected;
      console.log(`${passed ? '✅' : '❌'} formatPHP(${test.input}) = "${result}" ${passed ? '' : `(expected: "${test.expected}")`}`);
    });
  } else {
    console.log('⚠️  formatPHP function not found in window context');
  }
  
  // Test 3: Check specific components
  console.log('\n\nChecking specific components:');
  console.log('=============================');
  
  // Check Earnings Report
  const earningsElements = document.querySelectorAll('[class*="earnings"], [class*="revenue"], [class*="price"]');
  console.log(`Found ${earningsElements.length} elements with earnings/revenue/price classes`);
  
  // Check Instructors tab
  const instructorCards = document.querySelectorAll('[class*="instructor"]');
  console.log(`Found ${instructorCards.length} instructor-related elements`);
  
  // Summary
  console.log('\n\nSummary:');
  console.log('========');
  console.log(`Total issues found: ${issues.length}`);
  console.log('\nRecommendations:');
  console.log('1. Ensure all monetary values use formatPHP() function');
  console.log('2. Never display raw numbers for prices, always format them');
  console.log('3. Check that backend returns numbers, not pre-formatted strings');
}

// Run the test
testDecimalFormatting();
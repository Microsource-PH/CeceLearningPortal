// Script to delete existing courses and create new ones with proper GHL schema
const http = require('http');

const API_BASE_URL = 'http://localhost:5295/api';

// Sherwin's credentials
const CREDENTIALS = {
  email: 'sherwin.alegre@example.com',
  password: 'Password123!'
};

// Simple HTTP request
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${result.message || JSON.stringify(result)}`));
          }
        } catch (e) {
          if (res.statusCode === 204) {
            resolve({ success: true });
          } else {
            resolve({ statusCode: res.statusCode, body: data });
          }
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// New courses with proper GHL schema (fixed for backend expectations)
const NEW_COURSES = [
  {
    // SPRINT COURSE
    title: "PHP Mastery Sprint: 7-Day Intensive",
    description: "Master PHP fundamentals in just 7 days with this intensive sprint course. Perfect for developers who want to quickly add PHP to their skillset. Daily lessons, hands-on exercises, and real-world projects ensure you'll be building PHP applications by the end of the week.",
    shortDescription: "Intensive 7-day PHP bootcamp with daily assignments",
    category: "Programming",
    level: "Beginner",
    language: "en",
    duration: "7 days",
    thumbnailUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=800&h=450&fit=crop",
    
    // GHL specific
    courseType: "Sprint",
    pricingModel: "OneTime",
    price: 1499,
    currency: "PHP",
    accessType: "Lifetime",
    
    // Features
    hasCertificate: true,
    hasCommunity: false,
    hasLiveSessions: false,
    hasDownloadableResources: true,
    hasAssignments: true,
    hasQuizzes: true,
    
    // Automation
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: true,
    automationAbandonmentSequence: true,
    
    // Content
    modules: [
      {
        title: "Day 1: PHP Fundamentals & Setup",
        description: "Get your development environment ready and write your first PHP scripts",
        order: 1,
        lessons: [
          { title: "Welcome & Course Overview", type: "Video", duration: "15:00", order: 1, isPreview: true },
          { title: "Installing PHP & XAMPP", type: "Video", duration: "20:00", order: 2 },
          { title: "Your First PHP Script", type: "Video", duration: "25:00", order: 3 },
          { title: "Day 1 Assignment", type: "Assignment", duration: "45:00", order: 4 }
        ]
      },
      {
        title: "Day 2: Variables & Data Types",
        description: "Master PHP variables, data types, and basic operations",
        order: 2,
        lessons: [
          { title: "Understanding Variables", type: "Video", duration: "30:00", order: 1 },
          { title: "Data Types in PHP", type: "Video", duration: "25:00", order: 2 },
          { title: "Type Juggling & Casting", type: "Video", duration: "20:00", order: 3 },
          { title: "Day 2 Quiz", type: "Quiz", duration: "15:00", order: 4 }
        ]
      },
      {
        title: "Day 3: Control Structures",
        description: "Learn conditionals and loops in PHP",
        order: 3,
        lessons: [
          { title: "If/Else Statements", type: "Video", duration: "25:00", order: 1 },
          { title: "Switch Statements", type: "Video", duration: "20:00", order: 2 },
          { title: "Loops in PHP", type: "Video", duration: "30:00", order: 3 },
          { title: "Day 3 Challenge", type: "Assignment", duration: "60:00", order: 4 }
        ]
      }
    ],
    
    objectives: [
      "Set up a complete PHP development environment",
      "Write and execute PHP scripts confidently",
      "Understand PHP syntax and best practices",
      "Build a simple PHP web application"
    ],
    prerequisites: [
      "Basic understanding of HTML",
      "Familiarity with any programming language helpful but not required"
    ]
  },
  
  {
    // MARATHON COURSE
    title: "Full-Stack Web Development Marathon",
    description: "Embark on a comprehensive 6-month journey to become a full-stack web developer. This marathon course covers everything from HTML/CSS basics to advanced PHP, MySQL, JavaScript, and modern frameworks. With weekly live sessions, mentorship, and a supportive cohort, you'll build multiple real-world projects and graduate job-ready.",
    shortDescription: "6-month intensive full-stack development program with mentorship",
    category: "Programming",
    level: "Beginner",
    language: "en",
    duration: "6 months",
    thumbnailUrl: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop",
    
    // GHL specific
    courseType: "Marathon",
    pricingModel: "PaymentPlan",
    price: 8999,
    currency: "PHP",
    accessType: "Lifetime",
    
    // Payment plan as object
    paymentPlanDetails: {
      numberOfPayments: 6,
      paymentAmount: 1499.83,
      frequency: "monthly"
    },
    
    // Features
    hasCertificate: true,
    hasCommunity: true,
    hasLiveSessions: true,
    hasDownloadableResources: true,
    hasAssignments: true,
    hasQuizzes: true,
    
    // Drip content
    dripContent: true,
    dripSchedule: {
      type: "sequential",
      delayDays: 7
    },
    
    // Automation
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: true,
    automationAbandonmentSequence: false,
    
    // Content
    modules: [
      {
        title: "Week 1-2: Web Fundamentals",
        description: "Master HTML5, CSS3, and responsive design principles",
        order: 1,
        lessons: [
          { title: "Marathon Kickoff Live Session", type: "Live", duration: "90:00", order: 1 },
          { title: "HTML5 Semantic Elements", type: "Video", duration: "45:00", order: 2 },
          { title: "CSS3 Advanced Selectors", type: "Video", duration: "40:00", order: 3 },
          { title: "Flexbox & Grid Mastery", type: "Video", duration: "60:00", order: 4 },
          { title: "Build Your First Website", type: "Assignment", duration: "180:00", order: 5 }
        ]
      },
      {
        title: "Week 3-4: JavaScript Foundations",
        description: "Deep dive into JavaScript programming",
        order: 2,
        lessons: [
          { title: "JavaScript Fundamentals", type: "Video", duration: "60:00", order: 1 },
          { title: "DOM Manipulation", type: "Video", duration: "45:00", order: 2 },
          { title: "ES6+ Features", type: "Video", duration: "50:00", order: 3 },
          { title: "Weekly Live Q&A", type: "Live", duration: "60:00", order: 4 }
        ]
      },
      {
        title: "Week 5-8: Backend with PHP & MySQL",
        description: "Build dynamic web applications with PHP and databases",
        order: 3,
        lessons: [
          { title: "PHP Advanced Concepts", type: "Video", duration: "90:00", order: 1 },
          { title: "MySQL Database Design", type: "Video", duration: "75:00", order: 2 },
          { title: "Building RESTful APIs", type: "Video", duration: "80:00", order: 3 },
          { title: "Group Project Kickoff", type: "Live", duration: "90:00", order: 4 }
        ]
      }
    ],
    
    objectives: [
      "Master front-end technologies: HTML, CSS, JavaScript",
      "Build dynamic backends with PHP and MySQL",
      "Develop 5+ portfolio-worthy projects",
      "Learn modern development workflows and tools",
      "Prepare for junior developer job interviews"
    ],
    prerequisites: [
      "Basic computer skills",
      "Dedication to commit 15-20 hours per week",
      "Laptop or desktop computer"
    ]
  },
  
  {
    // MEMBERSHIP COURSE
    title: "Sherwin's Coding Academy Membership",
    description: "Get unlimited access to our ever-growing library of programming courses, tutorials, and resources. New content added monthly, exclusive member-only workshops, live Q&A sessions, and access to our private community. Perfect for continuous learners who want to stay ahead in the tech industry.",
    shortDescription: "All-access membership to programming courses and community",
    category: "Programming",
    level: "AllLevels",
    language: "en",
    duration: "Ongoing",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=450&fit=crop",
    
    // GHL specific
    courseType: "Membership",
    pricingModel: "Subscription",
    price: 2499,
    currency: "PHP",
    subscriptionPeriod: "Monthly",
    accessType: "Limited",
    accessDuration: 30,
    enrollmentLimit: 500,
    
    // Features
    hasCertificate: false,
    hasCommunity: true,
    hasLiveSessions: true,
    hasDownloadableResources: true,
    hasAssignments: false,
    hasQuizzes: false,
    
    // Drip content
    dripContent: true,
    dripSchedule: {
      type: "scheduled",
      delayDays: 0
    },
    
    // Automation
    automationWelcomeEmail: true,
    automationCompletionCertificate: false,
    automationProgressReminders: true,
    automationAbandonmentSequence: true,
    
    // Content
    modules: [
      {
        title: "Welcome to the Academy",
        description: "Get oriented with your membership benefits",
        order: 1,
        lessons: [
          { title: "Welcome from Sherwin", type: "Video", duration: "10:00", order: 1, isPreview: true },
          { title: "How to Navigate the Academy", type: "Video", duration: "15:00", order: 2 },
          { title: "Joining Our Slack Community", type: "Document", duration: "5:00", order: 3 },
          { title: "This Month's Live Schedule", type: "Document", duration: "5:00", order: 4 }
        ]
      },
      {
        title: "PHP Mastery Path",
        description: "Complete PHP learning path from beginner to advanced",
        order: 2,
        lessons: [
          { title: "PHP Basics Course", type: "Video", duration: "300:00", order: 1 },
          { title: "Object-Oriented PHP", type: "Video", duration: "240:00", order: 2 },
          { title: "Laravel Framework", type: "Video", duration: "480:00", order: 3 }
        ]
      },
      {
        title: "JavaScript Journey",
        description: "Modern JavaScript and frameworks",
        order: 3,
        lessons: [
          { title: "JavaScript Fundamentals", type: "Video", duration: "360:00", order: 1 },
          { title: "React.js Masterclass", type: "Video", duration: "420:00", order: 2 },
          { title: "Node.js Backend", type: "Video", duration: "300:00", order: 3 }
        ]
      },
      {
        title: "Monthly Workshop Series",
        description: "Exclusive member-only workshops",
        order: 4,
        lessons: [
          { title: "Building SaaS with Laravel", type: "Live", duration: "120:00", order: 1 },
          { title: "AI Integration Workshop", type: "Live", duration: "90:00", order: 2 }
        ]
      }
    ],
    
    objectives: [
      "Access 50+ courses across multiple programming languages",
      "Stay updated with monthly new content",
      "Connect with a community of developers",
      "Get direct access to instructors through Q&A sessions"
    ],
    targetAudience: [
      "Continuous learners",
      "Professional developers wanting to expand skills",
      "Students preparing for tech careers",
      "Entrepreneurs building tech products"
    ]
  },
  
  {
    // CUSTOM COURSE
    title: "Introduction to Programming Thinking",
    description: "This free introductory course is designed for absolute beginners who want to understand the fundamentals of programming before choosing a specific language. Learn how programmers think, solve problems, and build applications. No coding experience required!",
    shortDescription: "Free intro to programming concepts and problem-solving",
    category: "Programming",
    level: "Beginner",
    language: "en",
    duration: "Self-paced",
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=450&fit=crop",
    
    // GHL specific
    courseType: "Custom",
    pricingModel: "Free",
    price: 0,
    currency: "PHP",
    accessType: "Lifetime",
    enrollmentLimit: 1000,
    
    // Features (custom mix)
    hasCertificate: true,
    hasCommunity: true,
    hasLiveSessions: false,
    hasDownloadableResources: true,
    hasAssignments: true,
    hasQuizzes: true,
    
    // No drip for free course
    dripContent: false,
    
    // Automation
    automationWelcomeEmail: true,
    automationCompletionCertificate: true,
    automationProgressReminders: false,
    automationAbandonmentSequence: false,
    
    // Content
    modules: [
      {
        title: "Programming Fundamentals",
        description: "Core concepts every programmer should understand",
        order: 1,
        lessons: [
          { title: "What is Programming?", type: "Video", duration: "25:00", order: 1, isPreview: true },
          { title: "How Computers Think", type: "Video", duration: "20:00", order: 2, isPreview: true },
          { title: "Problem Solving Strategies", type: "Video", duration: "30:00", order: 3 },
          { title: "Introduction to Algorithms", type: "Document", duration: "15:00", order: 4 },
          { title: "Check Your Understanding", type: "Quiz", duration: "15:00", order: 5 }
        ]
      },
      {
        title: "Choosing Your Path",
        description: "Explore different programming languages and career paths",
        order: 2,
        lessons: [
          { title: "Web Development Overview", type: "Video", duration: "30:00", order: 1 },
          { title: "Mobile App Development", type: "Video", duration: "25:00", order: 2 },
          { title: "Data Science & AI", type: "Video", duration: "25:00", order: 3 },
          { title: "Game Development", type: "Video", duration: "20:00", order: 4 },
          { title: "Career Planning Exercise", type: "Assignment", duration: "30:00", order: 5 }
        ]
      },
      {
        title: "Getting Started",
        description: "Set up your development environment and write your first code",
        order: 3,
        lessons: [
          { title: "Choosing Your First Language", type: "Video", duration: "35:00", order: 1 },
          { title: "Setting Up Your Environment", type: "Document", duration: "20:00", order: 2 },
          { title: "Resources for Continued Learning", type: "Document", duration: "10:00", order: 3 },
          { title: "Join Our Community", type: "Document", duration: "5:00", order: 4 }
        ]
      }
    ],
    
    objectives: [
      "Understand what programming is and how it works",
      "Learn problem-solving techniques used by programmers",
      "Explore different programming career paths",
      "Choose your first programming language with confidence",
      "Get connected with a supportive learning community"
    ],
    prerequisites: [],
    targetAudience: [
      "Complete beginners to programming",
      "Students considering a tech career",
      "Professionals looking to transition to tech",
      "Anyone curious about how software works"
    ]
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

async function recreateSherwinCourses() {
  console.log(`${colors.blue}🔄 Recreating Sherwin's Courses with GHL Schema${colors.reset}\n`);
  
  try {
    // Step 1: Login
    console.log(`${colors.yellow}🔐 Logging in...${colors.reset}`);
    const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(CREDENTIALS)
    });
    
    const authToken = loginResponse.accessToken;
    if (!authToken) {
      throw new Error('No auth token received');
    }
    console.log(`${colors.green}✅ Login successful${colors.reset}\n`);
    
    // Step 2: Get existing courses
    console.log(`${colors.yellow}📚 Fetching existing courses...${colors.reset}`);
    const coursesResponse = await makeRequest(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const existingCourses = Array.isArray(coursesResponse) ? coursesResponse : coursesResponse.data || [];
    const sherwinCourses = existingCourses.filter(course => 
      course.instructorId === loginResponse.id ||
      course.instructorName === 'Sherwin Alegre'
    );
    
    console.log(`Found ${sherwinCourses.length} existing courses\n`);
    
    // Step 3: Delete existing courses
    if (sherwinCourses.length > 0) {
      console.log(`${colors.yellow}🗑️  Deleting existing courses...${colors.reset}`);
      for (const course of sherwinCourses) {
        try {
          await makeRequest(`${API_BASE_URL}/courses/${course.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          console.log(`   ${colors.green}✅${colors.reset} Deleted: ${course.title}`);
        } catch (error) {
          console.log(`   ${colors.red}❌${colors.reset} Failed to delete: ${course.title} - ${error.message}`);
        }
      }
      console.log('');
    }
    
    // Step 4: Create new courses
    console.log(`${colors.cyan}🚀 Creating new courses with GHL schema...${colors.reset}\n`);
    const results = [];
    
    for (const courseData of NEW_COURSES) {
      console.log(`${colors.blue}📘 Creating: ${courseData.title}${colors.reset}`);
      console.log(`   Type: ${colors.yellow}${courseData.courseType}${colors.reset}`);
      console.log(`   Pricing: ${colors.yellow}${courseData.pricingModel}${colors.reset}`);
      
      try {
        const startTime = Date.now();
        
        // Ensure dripSchedule is sent as JSON string if it exists
        const courseToCreate = { ...courseData };
        if (courseToCreate.dripSchedule) {
          courseToCreate.dripScheduleJson = JSON.stringify(courseToCreate.dripSchedule);
          delete courseToCreate.dripSchedule;
        }
        
        const response = await makeRequest(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(courseToCreate)
        });
        
        const elapsed = Date.now() - startTime;
        
        console.log(`   ${colors.green}✅ Created successfully!${colors.reset}`);
        console.log(`   Course ID: ${response.id}`);
        console.log(`   Time: ${elapsed}ms\n`);
        
        results.push({
          type: courseData.courseType,
          title: courseData.title,
          id: response.id,
          status: 'SUCCESS'
        });
        
      } catch (error) {
        console.log(`   ${colors.red}❌ Failed: ${error.message}${colors.reset}\n`);
        results.push({
          type: courseData.courseType,
          title: courseData.title,
          status: 'FAILED',
          error: error.message
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Step 5: Summary
    console.log(`\n${colors.cyan}📊 Summary${colors.reset}`);
    console.log('==========\n');
    
    const successful = results.filter(r => r.status === 'SUCCESS').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    
    console.log(`Total Courses Created: ${results.length}`);
    console.log(`${colors.green}✅ Successful: ${successful}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}\n`);
    
    if (successful > 0) {
      console.log('Created courses:');
      results.filter(r => r.status === 'SUCCESS').forEach(r => {
        console.log(`  ${colors.green}•${colors.reset} ${r.type}: ${r.title} (ID: ${r.id})`);
      });
      
      console.log(`\n${colors.blue}📱 Next Steps:${colors.reset}`);
      console.log('1. Login as Sherwin at http://localhost:8081');
      console.log('2. Navigate to "My Courses"');
      console.log('3. Each course type demonstrates different GHL features:');
      console.log(`   ${colors.yellow}• Sprint:${colors.reset} Intensive daily learning with deadlines`);
      console.log(`   ${colors.yellow}• Marathon:${colors.reset} Cohort-based with payment plans and mentorship`);
      console.log(`   ${colors.yellow}• Membership:${colors.reset} Subscription model with ongoing content`);
      console.log(`   ${colors.yellow}• Custom:${colors.reset} Free course with flexible structure`);
    }
    
    console.log(`\n${colors.green}✨ Done!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
  }
}

// Run the script
console.clear();
recreateSherwinCourses();
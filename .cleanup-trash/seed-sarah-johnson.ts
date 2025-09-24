// Seed script for Sarah Johnson's data
// Run this script to create realistic analytics and earnings data

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get random date in the past N days
const getRandomPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

async function seedSarahJohnsonData() {
  try {
    console.log('Starting to seed data for Dr. Sarah Johnson...');

    // Step 1: Register Sarah Johnson as an instructor
    console.log('1. Creating Sarah Johnson account...');
    let sarahToken: string;
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        email: 'sarah.johnson@example.com',
        password: 'Creator123!',
        fullName: 'Dr. Sarah Johnson',
        role: 'Instructor'
      });
      sarahToken = registerResponse.data.accessToken;
    } catch (error: any) {
      // If already exists, login
      if (error.response?.status === 400) {
        console.log('   Sarah already exists, logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'sarah.johnson@example.com',
          password: 'Creator123!'
        });
        sarahToken = loginResponse.data.accessToken;
      } else {
        throw error;
      }
    }

    // Set authorization header
    const authHeader = { headers: { Authorization: `Bearer ${sarahToken}` } };

    // Step 2: Create courses
    console.log('2. Creating courses...');
    
    // Course 1: Advanced React Patterns & Performance
    const course1Response = await axios.post(`${API_BASE_URL}/courses`, {
      title: 'Advanced React Patterns & Performance',
      description: 'Master advanced React concepts including hooks, context, performance optimization, and architectural patterns. Learn from real-world examples and build scalable applications.',
      category: 'Web Development',
      level: 'Advanced',
      price: 4499.00,
      status: 'Active',
      duration: '8 hours',
      language: 'English',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&auto=format',
      learningObjectives: [
        'Master React Hooks and Custom Hooks',
        'Implement Context API effectively',
        'Optimize React performance',
        'Build scalable component architecture',
        'Handle complex state management',
        'Implement advanced patterns'
      ],
      requirements: [
        'Solid understanding of React basics',
        'JavaScript ES6+ knowledge',
        'Basic understanding of state management'
      ]
    }, authHeader);
    
    const course1Id = course1Response.data.id;
    console.log(`   Created Course 1: ${course1Id}`);

    // Course 2: JavaScript Fundamentals for Beginners
    const course2Response = await axios.post(`${API_BASE_URL}/courses`, {
      title: 'JavaScript Fundamentals for Beginners',
      description: 'Learn JavaScript from scratch with hands-on projects and real-world examples. Perfect for beginners who want to start their web development journey.',
      category: 'Programming',
      level: 'Beginner',
      price: 2999.00,
      status: 'Active',
      duration: '12 hours',
      language: 'English',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop&auto=format',
      learningObjectives: [
        'Understand JavaScript basics',
        'Work with variables and data types',
        'Master functions and objects',
        'Handle arrays and loops',
        'Understand DOM manipulation',
        'Build interactive web pages'
      ],
      requirements: [
        'Basic computer skills',
        'No programming experience required'
      ]
    }, authHeader);

    const course2Id = course2Response.data.id;
    console.log(`   Created Course 2: ${course2Id}`);

    // Step 3: Create student accounts
    console.log('3. Creating student accounts...');
    const students = [];
    
    for (let i = 1; i <= 10; i++) {
      try {
        const studentResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
          email: `student${i}@example.com`,
          password: 'Student123!',
          fullName: `Test Student ${i}`,
          role: 'Student'
        });
        students.push({
          id: studentResponse.data.userId,
          token: studentResponse.data.accessToken
        });
      } catch (error: any) {
        // If already exists, login
        if (error.response?.status === 400) {
          const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: `student${i}@example.com`,
            password: 'Student123!'
          });
          students.push({
            id: loginResponse.data.userId,
            token: loginResponse.data.accessToken
          });
        }
      }
      await delay(100); // Small delay between requests
    }
    console.log(`   Created ${students.length} student accounts`);

    // Step 4: Create enrollments and payments
    console.log('4. Creating enrollments and payments...');
    
    // Course 1: 50 enrollments over the past 6 months
    for (let i = 0; i < 50; i++) {
      const student = students[i % students.length];
      const enrollmentDate = getRandomPastDate(180);
      
      // Enroll in course
      await axios.post(`${API_BASE_URL}/enrollments`, {
        courseId: course1Id,
        enrollmentDate: enrollmentDate
      }, { headers: { Authorization: `Bearer ${student.token}` } });
      
      // Simulate payment
      await axios.post(`${API_BASE_URL}/payments`, {
        courseId: course1Id,
        amount: 4499.00,
        currency: 'PHP',
        paymentMethod: 'Credit Card',
        status: 'Completed',
        createdAt: enrollmentDate
      }, { headers: { Authorization: `Bearer ${student.token}` } });
      
      // Add review for some completed courses
      if (i < 20) {
        await axios.post(`${API_BASE_URL}/reviews`, {
          courseId: course1Id,
          rating: 4 + Math.random(),
          comment: 'Excellent course! Learned so much about React patterns and performance optimization.'
        }, { headers: { Authorization: `Bearer ${student.token}` } });
      }
      
      await delay(50);
    }
    console.log('   Created 50 enrollments for Course 1');

    // Course 2: 30 enrollments over the past 4 months
    for (let i = 0; i < 30; i++) {
      const student = students[i % students.length];
      const enrollmentDate = getRandomPastDate(120);
      
      // Enroll in course
      await axios.post(`${API_BASE_URL}/enrollments`, {
        courseId: course2Id,
        enrollmentDate: enrollmentDate
      }, { headers: { Authorization: `Bearer ${student.token}` } });
      
      // Simulate payment
      await axios.post(`${API_BASE_URL}/payments`, {
        courseId: course2Id,
        amount: 2999.00,
        currency: 'PHP',
        paymentMethod: 'Credit Card',
        status: 'Completed',
        createdAt: enrollmentDate
      }, { headers: { Authorization: `Bearer ${student.token}` } });
      
      // Add review for some completed courses
      if (i < 10) {
        await axios.post(`${API_BASE_URL}/reviews`, {
          courseId: course2Id,
          rating: 4.3 + Math.random() * 0.7,
          comment: 'Great course for beginners! Very clear explanations.'
        }, { headers: { Authorization: `Bearer ${student.token}` } });
      }
      
      await delay(50);
    }
    console.log('   Created 30 enrollments for Course 2');

    console.log('\nSuccessfully seeded data for Dr. Sarah Johnson!');
    console.log('Summary:');
    console.log('- 2 courses created');
    console.log('- 80 total enrollments');
    console.log('- Total revenue: ₱' + (50 * 4499 + 30 * 2999).toLocaleString());
    console.log('- Reviews added for completed courses');
    console.log('\nYou can now login as sarah.johnson@example.com with password Creator123!');

  } catch (error) {
    console.error('Error seeding data:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
  }
}

// Run the seed script
seedSarahJohnsonData();
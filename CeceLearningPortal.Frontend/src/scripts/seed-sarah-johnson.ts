// Script to seed Sarah Johnson's data through the database service
import DatabaseService from '../services/databaseService';

// Helper function to generate random past date
const getRandomPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Helper function to generate random future date  
const getRandomFutureDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date.toISOString();
};

export async function seedSarahJohnsonData() {
  console.log('Starting to seed data for Dr. Sarah Johnson...');
  
  try {
    // First ensure the database is initialized
    await DatabaseService.initializeDatabase();
    
    // Get Sarah's user ID (she should already exist from initial seed)
    const users = await DatabaseService.getUsers();
    const sarah = users.data?.find(u => u.email === 'sarah.johnson@example.com');
    
    if (!sarah) {
      console.error('Sarah Johnson not found in users. Please run the initial seed first.');
      return;
    }
    
    console.log('Found Sarah Johnson:', sarah.id);
    
    // Create realistic payment and enrollment data
    const courses = await DatabaseService.getCourses();
    const sarahCourses = courses.data?.filter(c => c.instructorId === sarah.id) || [];
    
    console.log(`Found ${sarahCourses.length} courses for Sarah`);
    
    // Get all students
    const students = users.data?.filter(u => u.role === 'Student') || [];
    console.log(`Found ${students.length} students`);
    
    // For each of Sarah's courses, create enrollments and payments
    for (const course of sarahCourses) {
      console.log(`\nProcessing course: ${course.title}`);
      
      // Determine number of enrollments based on course
      const enrollmentCount = course.title.includes('Advanced') ? 50 : 30;
      
      for (let i = 0; i < enrollmentCount && i < students.length; i++) {
        const student = students[i % students.length];
        const daysAgo = course.title.includes('Advanced') ? 180 : 120;
        const enrollmentDate = getRandomPastDate(daysAgo);
        
        // Create enrollment
        const progressPercentage = i < enrollmentCount * 0.4 ? 100 : // 40% completed
                                 i < enrollmentCount * 0.8 ? 30 + Math.random() * 60 : // 40% in progress
                                 0; // 20% not started
        
        const enrollmentData = {
          id: Date.now() + i,
          studentId: student.id,
          courseId: course.id,
          enrolledAt: enrollmentDate,
          progressPercentage,
          completedAt: progressPercentage === 100 ? 
            new Date(new Date(enrollmentDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
            null,
          certificateUrl: progressPercentage === 100 ? 
            `https://example.com/certificate/${course.id}-${student.id}` : 
            null
        };
        
        // Store enrollment in localStorage (simulating database)
        const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        enrollments.push(enrollmentData);
        localStorage.setItem('enrollments', JSON.stringify(enrollments));
        
        // Create payment
        const paymentData = {
          id: Date.now() + i + 1000,
          userId: student.id,
          courseId: course.id,
          amount: course.price,
          currency: 'PHP',
          status: 'Completed',
          paymentMethod: 'Credit Card',
          transactionId: `TXN-${Date.now()}-${i}`,
          description: `Payment for ${course.title}`,
          createdAt: enrollmentDate,
          updatedAt: enrollmentDate
        };
        
        // Store payment in localStorage
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push(paymentData);
        localStorage.setItem('payments', JSON.stringify(payments));
        
        // Add review for completed courses
        if (progressPercentage === 100 && Math.random() > 0.3) {
          const reviewData = {
            id: Date.now() + i + 2000,
            courseId: course.id,
            studentId: student.id,
            rating: 4 + Math.random(),
            comment: course.title.includes('Advanced') ? 
              'Excellent course! Learned so much about React patterns and performance optimization.' :
              'Great course for beginners! Very clear explanations and good pacing.',
            createdAt: new Date(new Date(enrollmentDate).getTime() + 35 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
          reviews.push(reviewData);
          localStorage.setItem('reviews', JSON.stringify(reviews));
        }
      }
      
      console.log(`Created ${enrollmentCount} enrollments for ${course.title}`);
    }
    
    // Add some subscription data
    const subscriptionPlans = JSON.parse(localStorage.getItem('subscriptionPlans') || '[]');
    if (subscriptionPlans.length > 0) {
      const premiumPlan = subscriptionPlans[0];
      
      // Add subscriptions for some students
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      for (let i = 0; i < 5 && i < students.length; i++) {
        const student = students[i];
        const subscription = {
          id: Date.now() + i + 3000,
          userId: student.id,
          subscriptionPlanId: premiumPlan.id,
          planName: premiumPlan.name,
          startDate: getRandomPastDate(90),
          endDate: getRandomFutureDate(275),
          status: 'Active',
          price: premiumPlan.monthlyPrice,
          currency: 'PHP',
          paymentMethod: 'Credit Card',
          createdAt: getRandomPastDate(90)
        };
        subscriptions.push(subscription);
      }
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      console.log('Created 5 active subscriptions');
    }
    
    console.log('\nSuccessfully seeded data for Dr. Sarah Johnson!');
    console.log('You can now view analytics and earnings in the marketplace.');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Auto-run if called directly
if (import.meta.url === `file://${__filename}`) {
  seedSarahJohnsonData();
}
import { query, queryOne } from '../server/database';
import bcrypt from 'bcryptjs';

async function seedSarahWilsonData() {
  console.log('Starting to seed Sarah Wilson data...');

  try {
    // Create Sarah Wilson user if not exists
    const sarahId = 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c';
    
    // Check if Sarah exists
    const existingSarah = await queryOne('SELECT id FROM users WHERE id = $1', [sarahId]);
    
    if (!existingSarah) {
      // Hash password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Create Sarah Wilson user
      await query(`
        INSERT INTO users (id, email, encrypted_password)
        VALUES ($1, $2, $3)
      `, [sarahId, 'sarah.wilson@example.com', hashedPassword]);
      
      // Create Sarah Wilson profile
      await query(`
        INSERT INTO profiles (id, full_name, role, avatar_url)
        VALUES ($1, $2, $3, $4)
      `, [
        sarahId,
        'Sarah Wilson',
        'Learner',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format'
      ]);
      
      console.log('Created Sarah Wilson user and profile');
    }

    // Create Dr. Sarah Johnson as instructor if not exists
    const instructorId = 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d';
    const existingInstructor = await queryOne('SELECT id FROM users WHERE id = $1', [instructorId]);
    
    if (!existingInstructor) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await query(`
        INSERT INTO users (id, email, encrypted_password)
        VALUES ($1, $2, $3)
      `, [instructorId, 'instructor@example.com', hashedPassword]);
      
      await query(`
        INSERT INTO profiles (id, full_name, role, avatar_url)
        VALUES ($1, $2, $3, $4)
      `, [
        instructorId,
        'Dr. Sarah Johnson',
        'Instructor',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format'
      ]);
      
      console.log('Created instructor user and profile');
    }

    // Create Computer Vision Fundamentals course if not exists
    const courseId = 2;
    const existingCourse = await queryOne('SELECT id FROM courses WHERE id = $1', [courseId]);
    
    if (!existingCourse) {
      await query(`
        INSERT INTO courses (id, title, description, price, original_price, instructor_id, category, duration, level, thumbnail, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        courseId,
        'Computer Vision Fundamentals',
        'Learn the basics of computer vision and image processing',
        1999.00,
        2499.00,
        instructorId,
        'Computer Vision',
        '32 hours',
        'Beginner',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
        'active'
      ]);
      
      console.log('Created Computer Vision Fundamentals course');
    }

    // Add Sarah Wilson's Premium subscription
    const existingSubscription = await queryOne(
      'SELECT id FROM subscriptions WHERE user_id = $1 AND status = $2',
      [sarahId, 'active']
    );
    
    if (!existingSubscription) {
      await query(`
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, expires_at, amount)
        VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '30 days', $4)
      `, [sarahId, 'premium', 'active', 49.99]);
      
      console.log('Created Sarah\'s premium subscription');
    }

    // Enroll Sarah Wilson in Computer Vision Fundamentals
    const existingEnrollment = await queryOne(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [sarahId, courseId]
    );
    
    if (!existingEnrollment) {
      await query(`
        INSERT INTO enrollments (user_id, course_id, enrolled_at, progress, status)
        VALUES ($1, $2, NOW() - INTERVAL '7 days', $3, $4)
      `, [sarahId, courseId, 45, 'active']);
      
      console.log('Enrolled Sarah in Computer Vision Fundamentals');
    } else {
      // Update existing enrollment
      await query(`
        UPDATE enrollments 
        SET progress = $1, status = $2, updated_at = NOW()
        WHERE user_id = $3 AND course_id = $4
      `, [45, 'active', sarahId, courseId]);
      
      console.log('Updated Sarah\'s enrollment progress');
    }

    // Add a transaction record for the subscription
    const existingTransaction = await queryOne(
      'SELECT id FROM transactions WHERE user_id = $1 AND type = $2',
      [sarahId, 'subscription']
    );
    
    if (!existingTransaction) {
      await query(`
        INSERT INTO transactions (user_id, amount, type, status, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [
        sarahId,
        49.99,
        'subscription',
        'completed'
      ]);
      
      console.log('Created transaction record for subscription');
    }

    // Update user stats for Sarah
    const userStatsExist = await queryOne(
      'SELECT user_id FROM user_stats WHERE user_id = $1',
      [sarahId]
    );
    
    if (!userStatsExist) {
      await query(`
        INSERT INTO user_stats (user_id, total_courses, in_progress_courses, total_hours)
        VALUES ($1, $2, $3, $4)
      `, [sarahId, 1, 1, 16]);
      
      console.log('Created user stats for Sarah');
    } else {
      await query(`
        UPDATE user_stats 
        SET total_courses = 1, in_progress_courses = 1, total_hours = 16
        WHERE user_id = $1
      `, [sarahId]);
      
      console.log('Updated user stats for Sarah');
    }

    console.log('✅ Sarah Wilson data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeder
seedSarahWilsonData();
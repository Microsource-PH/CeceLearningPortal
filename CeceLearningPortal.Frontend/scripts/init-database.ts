import { db, query, queryOne, transaction } from '../server/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function initDatabase() {
  console.log('Initializing database...');
  
  try {
    // Create user Sarah Wilson with Creator role
    const users = [
      {
        id: 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
        email: 'sarah.wilson@email.com',
        password: 'password123',
        fullName: 'Sarah Wilson',
        role: 'Creator',
        bio: 'Marketing professional passionate about teaching digital marketing strategies',
        location: 'San Francisco, CA',
        phoneNumber: '+1 (555) 123-4567'
      },
      {
        id: uuidv4(),
        email: 'john.creator@email.com',
        password: 'password123',
        fullName: 'John Creator',
        role: 'Creator',
        bio: 'Expert developer teaching web technologies',
        location: 'New York, NY'
      },
      {
        id: uuidv4(),
        email: 'learner1@email.com',
        password: 'password123',
        fullName: 'Alex Learner',
        role: 'Learner'
      },
      {
        id: uuidv4(),
        email: 'admin@email.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'Admin'
      }
    ];

    // Insert users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Check if user exists
      const existing = await queryOne('SELECT id FROM users WHERE email = $1', [user.email]);
      if (!existing) {
        await transaction(async (client) => {
          // Create user
          await client.query(`
            INSERT INTO users (id, email, encrypted_password)
            VALUES ($1, $2, $3)
          `, [user.id, user.email, hashedPassword]);

          // Create profile
          await client.query(`
            INSERT INTO profiles (id, full_name, role, bio, location, phone_number, avatar_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            user.id, 
            user.fullName, 
            user.role, 
            user.bio || null,
            user.location || null,
            user.phoneNumber || null,
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`
          ]);

          // Create user stats
          await client.query(`
            INSERT INTO user_stats (user_id) VALUES ($1)
          `, [user.id]);

          // Create instructor stats if creator
          if (user.role === 'Creator') {
            await client.query(`
              INSERT INTO instructor_stats (user_id) VALUES ($1)
            `, [user.id]);
          }
        });
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    // Create sample courses
    const courses = [
      {
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the basics of digital marketing including SEO, social media, and content marketing',
        instructor_id: 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c', // Sarah Wilson
        price: 49.99,
        original_price: 99.99,
        category: 'Marketing',
        duration: '8 hours',
        level: 'Beginner',
        thumbnail: '/placeholder.svg',
        status: 'active',
        features: JSON.stringify(['Video lessons', 'Quizzes', 'Certificate of completion'])
      },
      {
        title: 'Advanced Social Media Strategies',
        description: 'Master advanced social media marketing techniques for business growth',
        instructor_id: 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c',
        price: 79.99,
        original_price: 149.99,
        category: 'Marketing',
        duration: '12 hours',
        level: 'Advanced',
        thumbnail: '/placeholder.svg',
        status: 'active',
        features: JSON.stringify(['HD videos', 'Real projects', 'Lifetime access'])
      }
    ];

    // Insert courses
    for (const course of courses) {
      const existing = await queryOne(
        'SELECT id FROM courses WHERE title = $1 AND instructor_id = $2',
        [course.title, course.instructor_id]
      );
      
      if (!existing) {
        await query(`
          INSERT INTO courses (
            title, description, instructor_id, price, original_price,
            category, duration, level, thumbnail, status, features
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        `, [
          course.title, course.description, course.instructor_id,
          course.price, course.original_price, course.category,
          course.duration, course.level, course.thumbnail,
          course.status, course.features
        ]);
        console.log(`Created course: ${course.title}`);
      } else {
        console.log(`Course already exists: ${course.title}`);
      }
    }

    // Update instructor stats for Sarah Wilson
    const sarahCourses = await query(
      'SELECT COUNT(*) as count FROM courses WHERE instructor_id = $1 AND status = $2',
      ['b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c', 'active']
    );
    
    await query(`
      UPDATE instructor_stats 
      SET active_courses = $1
      WHERE user_id = $2
    `, [parseInt(sarahCourses[0].count), 'b5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0c']);

    console.log('Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initDatabase();
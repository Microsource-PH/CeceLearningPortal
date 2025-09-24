import { db, query, queryOne, transaction } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export class PostgresService {
  // Authentication methods
  static async login(email: string, password: string) {
    try {
      // Get user with password
      const user = await queryOne(`
        SELECT u.*, p.full_name, p.role, p.avatar_url
        FROM users u
        JOIN profiles p ON u.id = p.id
        WHERE u.email = $1
      `, [email]);

      if (!user) {
        return { error: 'Invalid credentials' };
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.encrypted_password);
      if (!validPassword) {
        return { error: 'Invalid credentials' };
      }

      // Generate session tokens
      const accessToken = uuidv4();
      const refreshToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create session
      await query(`
        INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [user.id, accessToken, refreshToken, expiresAt]);

      // Update last login
      await query(`
        UPDATE profiles SET last_login = NOW() WHERE id = $1
      `, [user.id]);

      return {
        data: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          avatar: user.avatar_url,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Login failed' };
    }
  }

  static async register(email: string, password: string, fullName: string, role: string = 'Learner') {
    try {
      // Check if user exists
      const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
      if (existing) {
        return { error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      // Create user and profile in transaction
      const result = await transaction(async (client) => {
        // Create user
        await client.query(`
          INSERT INTO users (id, email, encrypted_password)
          VALUES ($1, $2, $3)
        `, [userId, email, hashedPassword]);

        // Create profile
        await client.query(`
          INSERT INTO profiles (id, full_name, role, avatar_url)
          VALUES ($1, $2, $3, $4)
        `, [userId, fullName, role, `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`]);

        // Create user stats
        await client.query(`
          INSERT INTO user_stats (user_id) VALUES ($1)
        `, [userId]);

        // Create instructor stats if creator
        if (role === 'Creator') {
          await client.query(`
            INSERT INTO instructor_stats (user_id) VALUES ($1)
          `, [userId]);
        }

        return userId;
      });

      // Generate tokens
      const accessToken = uuidv4();
      const refreshToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await query(`
        INSERT INTO sessions (user_id, access_token, refresh_token, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [userId, accessToken, refreshToken, expiresAt]);

      return {
        data: {
          id: userId,
          email,
          fullName,
          role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Registration failed' };
    }
  }

  // Course methods
  static async getCourses(filters?: any) {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (filters?.status) {
        whereClause += ` AND c.status = $${++paramCount}`;
        params.push(filters.status);
      }

      if (filters?.instructor_id) {
        whereClause += ` AND c.instructor_id = $${++paramCount}`;
        params.push(filters.instructor_id);
      }

      if (filters?.category) {
        whereClause += ` AND c.category = $${++paramCount}`;
        params.push(filters.category);
      }

      const courses = await query(`
        SELECT 
          c.*,
          p.full_name as instructor_name,
          COUNT(DISTINCT e.user_id) as enrolled_students,
          COALESCE(
            (SELECT ARRAY_AGG(feature ORDER BY display_order) 
             FROM course_features 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as features,
          COALESCE(
            (SELECT ARRAY_AGG(DISTINCT tag) 
             FROM course_tags 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as tags
        FROM courses c
        JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        ${whereClause}
        GROUP BY c.id, p.full_name
        ORDER BY c.created_at DESC
      `, params);

      return { data: courses, error: null };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, error: 'Failed to fetch courses' };
    }
  }

  static async getCourse(id: number) {
    try {
      const course = await queryOne(`
        SELECT 
          c.*,
          p.full_name as instructor_name,
          COUNT(DISTINCT e.user_id) as enrolled_students
        FROM courses c
        JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE c.id = $1
        GROUP BY c.id, p.full_name
      `, [id]);

      return { data: course, error: null };
    } catch (error) {
      console.error('Error fetching course:', error);
      return { data: null, error: 'Course not found' };
    }
  }

  // User profile methods
  static async getUserProfile(userId: string) {
    try {
      const profile = await queryOne(`
        SELECT u.id, u.email, u.created_at,
               p.full_name, p.avatar_url, p.bio, p.location, 
               p.phone_number, p.role, p.status, p.social_links, p.last_login
        FROM users u
        JOIN profiles p ON u.id = p.id
        WHERE u.id = $1
      `, [userId]);

      return { data: profile, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return { data: null, error: 'Profile not found' };
    }
  }

  static async getUserStats(userId: string) {
    try {
      const stats = await queryOne(`
        SELECT * FROM user_stats WHERE user_id = $1
      `, [userId]);

      if (!stats) {
        // Return default stats if not found
        return {
          data: {
            total_courses: 0,
            completed_courses: 0,
            in_progress_courses: 0,
            total_hours: 0,
            certificates: 0,
            average_score: 0,
            current_streak: 0,
            longest_streak: 0
          },
          error: null
        };
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error: 'Failed to fetch user stats' };
    }
  }

  static async getInstructorStats(userId: string) {
    try {
      const stats = await queryOne(`
        SELECT * FROM instructor_stats WHERE user_id = $1
      `, [userId]);

      if (!stats) {
        return {
          data: {
            total_students: 0,
            active_courses: 0,
            total_revenue: 0,
            average_rating: 0,
            completion_rate: 0,
            student_satisfaction: 0
          },
          error: null
        };
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      return { data: null, error: 'Failed to fetch instructor stats' };
    }
  }

  static async getPlatformStats() {
    try {
      const totalUsers = await queryOne('SELECT COUNT(*) as count FROM users');
      const totalCourses = await queryOne('SELECT COUNT(*) as count FROM courses WHERE status = $1', ['active']);
      const totalEnrollments = await queryOne('SELECT COUNT(*) as count FROM enrollments');
      const totalRevenue = await queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = $1', ['completed']);

      return {
        data: {
          totalUsers: parseInt(totalUsers.count),
          totalCourses: parseInt(totalCourses.count),
          totalEnrollments: parseInt(totalEnrollments.count),
          totalRevenue: parseFloat(totalRevenue.total),
          platformRevenue: parseFloat(totalRevenue.total) * 0.2,
          creatorEarnings: parseFloat(totalRevenue.total) * 0.8
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return { data: null, error: 'Failed to fetch platform stats' };
    }
  }

  // Enrollment methods
  static async getEnrollments(userId: string) {
    try {
      const enrollments = await query(`
        SELECT 
          e.*,
          c.title, c.description, c.thumbnail, c.category, c.level, c.duration,
          p.full_name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN profiles p ON c.instructor_id = p.id
        WHERE e.user_id = $1
        ORDER BY e.enrolled_at DESC
      `, [userId]);

      return { data: enrollments, error: null };
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return { data: null, error: 'Failed to fetch enrollments' };
    }
  }

  static async enrollInCourse(userId: string, courseId: number) {
    try {
      // Check if already enrolled
      const existing = await queryOne(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (existing) {
        return { error: 'Already enrolled in this course' };
      }

      // Create enrollment
      const enrollment = await queryOne(`
        INSERT INTO enrollments (user_id, course_id)
        VALUES ($1, $2)
        RETURNING *
      `, [userId, courseId]);

      // Update course stats
      await query(`
        UPDATE courses 
        SET total_students = total_students + 1 
        WHERE id = $1
      `, [courseId]);

      // Update user stats
      await query(`
        UPDATE user_stats 
        SET total_courses = total_courses + 1,
            in_progress_courses = in_progress_courses + 1
        WHERE user_id = $1
      `, [userId]);

      // Log activity
      await query(`
        INSERT INTO activities (user_id, type, title, course_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, 'course_enrolled', 'Enrolled in course', courseId, {}]);

      return { data: enrollment, error: null };
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return { data: null, error: 'Failed to enroll in course' };
    }
  }

  static async getUserCertificates(userId: string) {
    try {
      const certificates = await query(`
        SELECT 
          cert.*,
          c.title as course_title
        FROM certificates cert
        JOIN courses c ON cert.course_id = c.id
        WHERE cert.user_id = $1
        ORDER BY cert.issued_at DESC
      `, [userId]);

      return { data: certificates, error: null };
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return { data: null, error: 'Failed to fetch certificates' };
    }
  }

  static async getUserActivities(userId: string, limit: number = 20) {
    try {
      const activities = await query(`
        SELECT 
          a.*,
          c.title as course_title
        FROM activities a
        LEFT JOIN courses c ON a.course_id = c.id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return { data: activities, error: null };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { data: null, error: 'Failed to fetch activities' };
    }
  }

  static async getCreatorStats(creatorId: string) {
    try {
      // Get instructor stats
      const instructorStats = await this.getInstructorStats(creatorId);
      
      // Get courses
      const coursesResult = await this.getCourses({ instructor_id: creatorId });
      const courses = coursesResult.data || [];
      
      // Calculate revenue
      const revenueResult = await queryOne(`
        SELECT COALESCE(SUM(t.amount), 0) as total_revenue
        FROM transactions t
        JOIN courses c ON t.course_id = c.id
        WHERE c.instructor_id = $1 AND t.status = 'completed'
      `, [creatorId]);
      
      const totalRevenue = parseFloat(revenueResult?.total_revenue || '0');
      const creatorEarnings = totalRevenue * 0.8; // 80% to creator

      return {
        data: {
          ...instructorStats.data,
          totalCourses: courses.length,
          totalRevenue,
          creatorEarnings,
          platformFees: totalRevenue * 0.2,
          courses
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      return { data: null, error: 'Failed to fetch creator stats' };
    }
  }

  // Student-specific methods
  static async getStudentStats(userId: string) {
    try {
      // Get basic stats from user_stats table
      const userStats = await queryOne(`
        SELECT * FROM user_stats WHERE user_id = $1
      `, [userId]);

      // Get enrollment stats
      const enrollmentStats = await queryOne(`
        SELECT 
          COUNT(*) as total_courses,
          COUNT(CASE WHEN progress = 100 THEN 1 END) as completed_courses,
          COUNT(CASE WHEN progress > 0 AND progress < 100 THEN 1 END) as in_progress_courses
        FROM enrollments
        WHERE user_id = $1
      `, [userId]);

      // Get total spent
      const totalSpent = await queryOne(`
        SELECT COALESCE(SUM(amount), 0) as total_spent
        FROM transactions
        WHERE user_id = $1 AND status = 'completed'
      `, [userId]);
      
      return {
        data: {
          totalCourses: parseInt(enrollmentStats?.total_courses || '0'),
          completedCourses: parseInt(enrollmentStats?.completed_courses || '0'),
          inProgressCourses: parseInt(enrollmentStats?.in_progress_courses || '0'),
          totalCertificates: userStats?.certificates || 0,
          totalSpent: parseFloat(totalSpent?.total_spent || '0'),
          learningHours: Math.round(userStats?.total_hours || 0),
          currentStreak: userStats?.current_streak || 0,
          longestStreak: userStats?.longest_streak || 0,
          averageScore: userStats?.average_score || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return { data: null, error: 'Failed to fetch student stats' };
    }
  }

  static async getEnrolledCourses(userId: string) {
    try {
      const courses = await query(`
        SELECT 
          e.id,
          e.course_id,
          c.title,
          c.thumbnail,
          c.instructor_id,
          p.full_name as instructor,
          e.progress,
          CASE 
            WHEN e.progress = 0 THEN 'not_started'
            WHEN e.progress = 100 THEN 'completed'
            ELSE 'in_progress'
          END as status,
          e.enrolled_at,
          e.updated_at as last_accessed_at,
          e.completed_at,
          cert.id as certificate_id,
          100 as total_lessons,
          ROUND(e.progress) as completed_lessons
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN certificates cert ON cert.user_id = e.user_id AND cert.course_id = e.course_id
        WHERE e.user_id = $1
        ORDER BY e.updated_at DESC NULLS LAST, e.enrolled_at DESC
      `, [userId]);

      // Map courses to the expected format
      const coursesWithNextLesson = courses.map(course => ({
        ...course,
        courseId: course.course_id,
        progress: parseFloat(course.progress),
        enrolledAt: course.enrolled_at,
        lastAccessedAt: course.last_accessed_at,
        completedAt: course.completed_at,
        certificateUrl: course.certificate_id ? `/api/certificates/${course.certificate_id}` : null,
        totalLessons: parseInt(course.total_lessons),
        completedLessons: parseInt(course.completed_lessons),
        nextLesson: course.progress < 100 ? {
          id: 1,
          title: 'Next Lesson',
          type: 'video'
        } : null
      }));

      return {
        data: coursesWithNextLesson,
        error: null
      };
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return { data: null, error: 'Failed to fetch enrolled courses' };
    }
  }

  static async getCurrentSubscription(userId: string) {
    try {
      const subscription = await queryOne(`
        SELECT 
          s.id,
          s.plan_id as "planId",
          s.status,
          s.start_date as "startDate",
          s.expires_at as "endDate",
          s.amount,
          s.created_at as "createdAt",
          s.updated_at as "updatedAt"
        FROM subscriptions s
        WHERE s.user_id = $1 AND s.status = 'active'
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [userId]);

      return {
        data: subscription || null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return { data: null, error: 'Failed to fetch subscription' };
    }
  }

  static async getCourseProgress(userId: string, courseId: number) {
    try {
      // Get enrollment
      const enrollment = await queryOne(`
        SELECT id FROM enrollments 
        WHERE user_id = $1 AND course_id = $2
      `, [userId, courseId]);

      if (!enrollment) {
        return { data: null, error: 'Not enrolled in this course' };
      }

      // Get course sections and lessons with progress
      const sections = await query(`
        SELECT 
          cs.id,
          cs.title,
          cs.order_index,
          json_agg(
            json_build_object(
              'id', cl.id,
              'title', cl.title,
              'type', cl.type,
              'duration', cl.duration_minutes || ' min',
              'isCompleted', COALESCE(lp.status = 'completed', false),
              'completedAt', lp.completed_at
            ) ORDER BY cl.order_index
          ) as lessons
        FROM course_sections cs
        LEFT JOIN course_lessons cl ON cs.id = cl.section_id
        LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id AND lp.user_id = $1
        WHERE cs.course_id = $2
        GROUP BY cs.id, cs.title, cs.order_index
        ORDER BY cs.order_index
      `, [userId, courseId]);

      // Calculate overall progress
      const progressResult = await queryOne(`
        SELECT calculate_course_progress($1) as progress
      `, [enrollment.id]);

      // Get last accessed lesson
      const lastAccessed = await queryOne(`
        SELECT lesson_id FROM lesson_progress
        WHERE user_id = $1 AND enrollment_id = $2
        ORDER BY updated_at DESC
        LIMIT 1
      `, [userId, enrollment.id]);

      // Format modules with progress
      const modules = sections.map((section: any) => ({
        id: section.id,
        title: section.title,
        order: section.order_index,
        lessons: section.lessons || [],
        progress: section.lessons ? 
          (section.lessons.filter((l: any) => l.isCompleted).length / section.lessons.length) * 100 : 0
      }));

      return {
        data: {
          courseId,
          enrollmentId: enrollment.id,
          modules,
          overallProgress: parseFloat(progressResult?.progress || '0'),
          lastAccessedLessonId: lastAccessed?.lesson_id
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return { data: null, error: 'Failed to fetch course progress' };
    }
  }

  static async updateLessonProgress(userId: string, lessonId: number, status: string) {
    try {
      // Get enrollment for this lesson
      const enrollment = await queryOne(`
        SELECT e.id
        FROM enrollments e
        JOIN course_lessons cl ON e.course_id = cl.course_id
        WHERE e.user_id = $1 AND cl.id = $2
      `, [userId, lessonId]);

      if (!enrollment) {
        return { error: 'Not enrolled in this course' };
      }

      // Update or insert lesson progress
      await query(`
        INSERT INTO lesson_progress (user_id, lesson_id, enrollment_id, status, progress_percentage, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, lesson_id)
        DO UPDATE SET 
          status = $4,
          progress_percentage = $5,
          completed_at = $6,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId, 
        lessonId, 
        enrollment.id, 
        status,
        status === 'completed' ? 100 : 50,
        status === 'completed' ? new Date() : null
      ]);

      // Log activity
      if (status === 'completed') {
        const lesson = await queryOne(`
          SELECT cl.title, cl.course_id, c.title as course_title
          FROM course_lessons cl
          JOIN courses c ON cl.course_id = c.id
          WHERE cl.id = $1
        `, [lessonId]);

        await query(`
          INSERT INTO activities (user_id, type, title, course_id, details)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          userId, 
          'lesson_completed', 
          `Completed lesson: ${lesson.title}`,
          lesson.course_id,
          { lesson_title: lesson.title, course_title: lesson.course_title }
        ]);
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return { data: null, error: 'Failed to update lesson progress' };
    }
  }

  static async getLearningActivity(userId: string, limit: number = 10) {
    try {
      const activities = await query(`
        SELECT 
          a.id,
          a.type,
          a.title,
          a.details->>'description' as description,
          a.created_at as timestamp,
          a.course_id as "courseId",
          c.title as "courseName"
        FROM activities a
        LEFT JOIN courses c ON a.course_id = c.id
        WHERE a.user_id = $1
        AND a.type IN ('lesson_completed', 'course_enrolled', 'certificate_earned', 'quiz_passed')
        ORDER BY a.created_at DESC
        LIMIT $2
      `, [userId, limit]);

      return { data: activities, error: null };
    } catch (error) {
      console.error('Error fetching learning activity:', error);
      return { data: null, error: 'Failed to fetch learning activity' };
    }
  }

  static async getCourse(courseId: number) {
    try {
      const course = await queryOne(`
        SELECT 
          c.*,
          p.full_name as instructor_name,
          COUNT(DISTINCT e.user_id) as enrolled_students,
          COALESCE(AVG(r.rating)::float, 0) as average_rating,
          COALESCE(
            (SELECT ARRAY_AGG(feature ORDER BY display_order) 
             FROM course_features 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as features,
          COALESCE(
            (SELECT ARRAY_AGG(DISTINCT tag) 
             FROM course_tags 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as tags,
          COALESCE(
            (SELECT ARRAY_AGG(objective ORDER BY display_order) 
             FROM course_objectives 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as objectives,
          COALESCE(
            (SELECT ARRAY_AGG(prerequisite_text ORDER BY display_order) 
             FROM course_prerequisites 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as prerequisites
        FROM courses c
        JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN course_reviews r ON c.id = r.course_id
        WHERE c.id = $1
        GROUP BY c.id, p.full_name
      `, [courseId]);

      if (!course) {
        return { error: 'Course not found' };
      }

      // Get course modules and lessons
      const modules = await query(`
        SELECT 
          m.*,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', l.id,
              'title', l.title,
              'description', l.description,
              'duration_minutes', l.duration_minutes,
              'content_type', l.content_type,
              'content_url', l.content_url,
              'is_preview', l.is_preview,
              'display_order', l.display_order
            ) ORDER BY l.display_order)
            FROM course_lessons l
            WHERE l.module_id = m.id),
            '[]'::json
          ) as lessons
        FROM course_modules m
        WHERE m.course_id = $1
        ORDER BY m.display_order
      `, [courseId]);

      return { 
        data: {
          ...course,
          modules: modules
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching course:', error);
      return { data: null, error: 'Failed to fetch course' };
    }
  }

  static async getCourses(filters?: any) {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;

      if (filters?.status) {
        whereClause += ` AND c.status = $${++paramCount}`;
        params.push(filters.status);
      }

      if (filters?.instructor_id) {
        whereClause += ` AND c.instructor_id = $${++paramCount}`;
        params.push(filters.instructor_id);
      }

      if (filters?.category) {
        whereClause += ` AND c.category = $${++paramCount}`;
        params.push(filters.category);
      }

      const courses = await query(`
        SELECT 
          c.*,
          p.full_name as instructor_name,
          COUNT(DISTINCT e.user_id) as enrolled_students,
          COALESCE(AVG(r.rating)::float, 0) as average_rating,
          COALESCE(
            (SELECT ARRAY_AGG(feature ORDER BY display_order) 
             FROM course_features 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as features,
          COALESCE(
            (SELECT ARRAY_AGG(DISTINCT tag) 
             FROM course_tags 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as tags
        FROM courses c
        JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN course_reviews r ON c.id = r.course_id
        ${whereClause}
        GROUP BY c.id, p.full_name
        ORDER BY c.created_at DESC
      `, params);

      return { data: courses, error: null };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, error: 'Failed to fetch courses' };
    }
  }

  static async getMarketplaceCourses(filters?: any) {
    try {
      let whereClause = 'WHERE c.status = $1';
      const params: any[] = ['active'];
      let paramCount = 1;

      if (filters?.category) {
        whereClause += ` AND c.category = $${++paramCount}`;
        params.push(filters.category);
      }

      if (filters?.search) {
        whereClause += ` AND (c.title ILIKE $${++paramCount} OR c.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      const courses = await query(`
        SELECT 
          c.*,
          p.full_name as instructor_name,
          COUNT(DISTINCT e.user_id) as enrolled_students,
          COALESCE(AVG(r.rating)::float, 0) as average_rating,
          COALESCE(
            (SELECT ARRAY_AGG(feature ORDER BY display_order) 
             FROM course_features 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as features,
          COALESCE(
            (SELECT ARRAY_AGG(DISTINCT tag) 
             FROM course_tags 
             WHERE course_id = c.id),
            ARRAY[]::VARCHAR[]
          ) as tags
        FROM courses c
        JOIN profiles p ON c.instructor_id = p.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN course_reviews r ON c.id = r.course_id
        ${whereClause}
        GROUP BY c.id, p.full_name
        ORDER BY c.created_at DESC
      `, params);

      return { data: courses, error: null };
    } catch (error) {
      console.error('Error fetching marketplace courses:', error);
      return { data: null, error: 'Failed to fetch marketplace courses' };
    }
  }

  // Admin methods
  static async getAllUsers() {
    try {
      const users = await query(`
        SELECT 
          p.*,
          u.email,
          u.created_at as user_created_at,
          COUNT(DISTINCT e.course_id) as courses_enrolled,
          COUNT(DISTINCT e.course_id) FILTER (WHERE e.status = 'completed') as courses_completed,
          COALESCE(SUM(DISTINCT c.price), 0) as total_spent
        FROM profiles p
        JOIN users u ON p.id = u.id
        LEFT JOIN enrollments e ON p.id = e.user_id
        LEFT JOIN courses c ON e.course_id = c.id
        GROUP BY p.id, u.email, u.created_at
        ORDER BY u.created_at DESC
      `);

      return { data: users, error: null };
    } catch (error) {
      console.error('Error fetching all users:', error);
      return { data: null, error: 'Failed to fetch users' };
    }
  }
}

import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { PostgresService } from '../postgresService';
import { db } from '../database';

const router = Router();

// Get course by ID (simple)
router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const result = await db.query(`
      SELECT 
        c.*,
        p.full_name as instructor_name,
        p.avatar_url as instructor_avatar,
        p.bio as instructor_bio,
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
      GROUP BY c.id, p.full_name, p.avatar_url, p.bio
    `, [courseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = result.rows[0];

    // Get course modules and lessons
    const modules = await db.query(`
      SELECT 
        m.*,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', l.id,
            'title', l.title,
            'description', l.description,
            'duration', l.duration_minutes || ' min',
            'type', l.content_type,
            'content_url', l.content_url,
            'isPreview', l.is_preview,
            'order', l.display_order
          ) ORDER BY l.display_order)
          FROM course_lessons l
          WHERE l.module_id = m.id),
          '[]'::json
        ) as lessons
      FROM course_modules m
      WHERE m.course_id = $1
      ORDER BY m.display_order
    `, [courseId]);

    // Get instructor stats
    const instructorStats = await db.query(`
      SELECT 
        COUNT(DISTINCT c2.id) as total_courses,
        COUNT(DISTINCT e2.user_id) as total_students,
        COALESCE(AVG(r2.rating)::float, 0) as average_rating
      FROM courses c2
      LEFT JOIN enrollments e2 ON c2.id = e2.course_id
      LEFT JOIN course_reviews r2 ON c2.id = r2.course_id
      WHERE c2.instructor_id = $1
      GROUP BY c2.instructor_id
    `, [course.instructor_id]);

    // Transform data for frontend
    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail,
      price: course.price,
      originalPrice: course.original_price,
      discount: course.original_price ? Math.round((1 - course.price / course.original_price) * 100) : 0,
      duration: course.duration,
      level: course.level,
      category: course.category,
      status: course.status,
      courseType: course.course_type,
      rating: parseFloat(course.average_rating) || 0,
      enrollmentCount: parseInt(course.enrolled_students) || 0,
      features: course.features || [],
      tags: course.tags || [],
      objectives: course.objectives || [],
      prerequisites: course.prerequisites || [],
      modules: modules.rows || [],
      
      // Instructor info
      instructorName: course.instructor_name,
      instructorAvatar: course.instructor_avatar,
      instructorBio: course.instructor_bio || 'Experienced instructor with a passion for teaching.',
      instructorTitle: 'Professional Instructor',
      instructorStats: instructorStats.rows[0] || {
        total_courses: 0,
        total_students: 0,
        average_rating: 0
      },
      
      // Course features flags
      hasCertificate: true,
      hasCommunity: true,
      hasLiveSessions: false,
      hasDownloadableResources: true,
      hasAssignments: true,
      hasQuizzes: true,
      
      // Access info
      accessType: 'Lifetime',
      language: 'en',
      enrollmentLimit: null,
      dripContent: false
    };

    res.json(courseData);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get course with all normalized data
router.get('/courses/:id/full', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    // Get course with instructor info
    const courseQuery = `
      SELECT c.*, p.full_name as instructor_name, p.avatar_url as instructor_avatar
      FROM courses c
      JOIN profiles p ON c.instructor_id = p.id
      WHERE c.id = $1
    `;
    const courseResult = await db.query(courseQuery, [courseId]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const course = courseResult.rows[0];
    
    // Get features
    const featuresResult = await db.query(
      'SELECT * FROM course_features WHERE course_id = $1 ORDER BY display_order',
      [courseId]
    );
    
    // Get tags
    const tagsResult = await db.query(
      'SELECT * FROM course_tags WHERE course_id = $1',
      [courseId]
    );
    
    // Get prerequisites
    const prerequisitesResult = await db.query(
      'SELECT * FROM course_prerequisites WHERE course_id = $1 ORDER BY display_order',
      [courseId]
    );
    
    // Get objectives
    const objectivesResult = await db.query(
      'SELECT * FROM course_objectives WHERE course_id = $1 ORDER BY display_order',
      [courseId]
    );
    
    // Get modules with lessons
    const modulesResult = await db.query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY display_order',
      [courseId]
    );
    
    const modules = await Promise.all(modulesResult.rows.map(async (module) => {
      const lessonsResult = await db.query(
        'SELECT * FROM course_lessons WHERE module_id = $1 ORDER BY display_order',
        [module.id]
      );
      return {
        ...module,
        lessons: lessonsResult.rows
      };
    }));
    
    // Get reviews with user info
    const reviewsResult = await db.query(`
      SELECT r.*, p.full_name as user_name, p.avatar_url as user_avatar,
             rr.response as instructor_response, rr.created_at as response_date
      FROM course_reviews r
      JOIN profiles p ON r.user_id = p.id
      LEFT JOIN review_responses rr ON r.id = rr.review_id
      WHERE r.course_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [courseId]);
    
    res.json({
      ...course,
      features: featuresResult.rows,
      tags: tagsResult.rows,
      prerequisites: prerequisitesResult.rows,
      objectives: objectivesResult.rows,
      modules: modules,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Basic create course endpoint (for frontend compatibility)
router.post('/courses', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const courseData = req.body;
    const instructorId = req.user?.id;
    
    console.log('Creating course via basic endpoint:', { 
      title: courseData.title, 
      instructorId, 
      userRole: req.user?.role 
    });
    
    // Allow Creator, Instructor, and Admin roles
    if (req.user?.role !== 'Creator' && req.user?.role !== 'Admin' && req.user?.role !== 'Instructor') {
      console.log('Role check failed:', req.user?.role);
      return res.status(403).json({ error: 'Only creators can create courses' });
    }
    
    await client.query('BEGIN');
    
    // Create the course
    const courseResult = await client.query(`
      INSERT INTO courses (
        title, description, instructor_id, price, original_price,
        category, duration, level, thumbnail, status, course_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      courseData.title,
      courseData.description,
      instructorId,
      courseData.price || 0,
      courseData.originalPrice,
      courseData.category,
      courseData.duration,
      courseData.level,
      courseData.thumbnail || courseData.thumbnailUrl,
      courseData.status || 'draft',
      courseData.courseType || 'Custom'
    ]);
    
    const newCourse = courseResult.rows[0];
    const courseId = newCourse.id;
    
    // Add features if provided
    if (courseData.features && courseData.features.length > 0) {
      for (let i = 0; i < courseData.features.length; i++) {
        await client.query(
          'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3)',
          [courseId, courseData.features[i], i]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return the course in the format expected by frontend
    res.json({
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      instructorId: newCourse.instructor_id,
      price: newCourse.price,
      originalPrice: newCourse.original_price,
      duration: newCourse.duration,
      level: newCourse.level,
      category: newCourse.category,
      status: newCourse.status,
      thumbnail: newCourse.thumbnail,
      courseType: newCourse.course_type,
      createdAt: newCourse.created_at,
      updatedAt: newCourse.updated_at,
      features: courseData.features || []
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  } finally {
    client.release();
  }
});

// Create course with normalized data
router.post('/courses/create-with-details', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const { course, features = [], tags = [], objectives = [], prerequisites = [] } = req.body;
    const instructorId = req.user?.id;
    
    console.log('Creating course:', { 
      title: course.title, 
      instructorId, 
      userRole: req.user?.role,
      features: features.length,
      tags: tags.length 
    });
    
    // Allow Creator, Instructor, and Admin roles
    if (req.user?.role !== 'Creator' && req.user?.role !== 'Admin' && req.user?.role !== 'Instructor') {
      console.log('Role check failed:', req.user?.role);
      return res.status(403).json({ error: 'Only creators can create courses' });
    }
    
    await client.query('BEGIN');
    
    // Create the course
    const courseResult = await client.query(`
      INSERT INTO courses (
        title, description, instructor_id, price, original_price,
        category, duration, level, thumbnail, status, course_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      course.title,
      course.description,
      instructorId,
      course.price || 0,
      course.original_price,
      course.category,
      course.duration,
      course.level,
      course.thumbnail,
      course.status || 'draft',
      course.course_type || 'Custom'
    ]);
    
    const newCourse = courseResult.rows[0];
    const courseId = newCourse.id;
    
    // Add features
    for (let i = 0; i < features.length; i++) {
      await client.query(
        'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3)',
        [courseId, features[i], i]
      );
    }
    
    // Add tags
    for (const tag of tags) {
      await client.query(
        'INSERT INTO course_tags (course_id, tag) VALUES ($1, $2)',
        [courseId, tag]
      );
    }
    
    // Add objectives
    for (let i = 0; i < objectives.length; i++) {
      await client.query(
        'INSERT INTO course_objectives (course_id, objective, display_order) VALUES ($1, $2, $3)',
        [courseId, objectives[i], i]
      );
    }
    
    // Add prerequisites
    for (let i = 0; i < prerequisites.length; i++) {
      const prereq = prerequisites[i];
      await client.query(
        'INSERT INTO course_prerequisites (course_id, prerequisite_course_id, prerequisite_text, display_order) VALUES ($1, $2, $3, $4)',
        [courseId, prereq.prerequisite_course_id, prereq.prerequisite_text, i]
      );
    }
    
    await client.query('COMMIT');
    
    // Return the full course object
    res.json({
      ...newCourse,
      features: features.map((f, i) => ({ feature: f, display_order: i })),
      tags: tags.map(t => ({ tag: t })),
      objectives: objectives.map((o, i) => ({ objective: o, display_order: i })),
      prerequisites: prerequisites
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  } finally {
    client.release();
  }
});

// Update course
router.put('/courses/:id', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const courseId = parseInt(req.params.id);
    const courseData = req.body;
    
    // Check if user owns the course
    const courseResult = await client.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (courseResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await client.query('BEGIN');
    
    // Update course basic info
    const updateResult = await client.query(`
      UPDATE courses 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        original_price = COALESCE($4, original_price),
        category = COALESCE($5, category),
        duration = COALESCE($6, duration),
        level = COALESCE($7, level),
        thumbnail = COALESCE($8, thumbnail),
        status = COALESCE($9, status),
        course_type = COALESCE($10, course_type),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      courseData.title,
      courseData.description,
      courseData.price,
      courseData.original_price || courseData.originalPrice,
      courseData.category,
      courseData.duration,
      courseData.level,
      courseData.thumbnail || courseData.thumbnailUrl,
      courseData.status,
      courseData.course_type || courseData.courseType,
      courseId
    ]);
    
    const updatedCourse = updateResult.rows[0];
    
    // Update features if provided
    if (courseData.features && Array.isArray(courseData.features)) {
      // Delete existing features
      await client.query('DELETE FROM course_features WHERE course_id = $1', [courseId]);
      
      // Add new features
      for (let i = 0; i < courseData.features.length; i++) {
        await client.query(
          'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3)',
          [courseId, courseData.features[i], i]
        );
      }
    }
    
    // Update tags if provided
    if (courseData.tags && Array.isArray(courseData.tags)) {
      // Delete existing tags
      await client.query('DELETE FROM course_tags WHERE course_id = $1', [courseId]);
      
      // Add new tags
      for (const tag of courseData.tags) {
        await client.query(
          'INSERT INTO course_tags (course_id, tag) VALUES ($1, $2)',
          [courseId, tag]
        );
      }
    }
    
    // Update objectives if provided
    if (courseData.objectives && Array.isArray(courseData.objectives)) {
      // Delete existing objectives
      await client.query('DELETE FROM course_objectives WHERE course_id = $1', [courseId]);
      
      // Add new objectives
      for (let i = 0; i < courseData.objectives.length; i++) {
        await client.query(
          'INSERT INTO course_objectives (course_id, objective, display_order) VALUES ($1, $2, $3)',
          [courseId, courseData.objectives[i], i]
        );
      }
    }
    
    // Update prerequisites if provided
    if (courseData.prerequisites && Array.isArray(courseData.prerequisites)) {
      // Delete existing prerequisites
      await client.query('DELETE FROM course_prerequisites WHERE course_id = $1', [courseId]);
      
      // Add new prerequisites
      for (let i = 0; i < courseData.prerequisites.length; i++) {
        const prereq = courseData.prerequisites[i];
        await client.query(
          'INSERT INTO course_prerequisites (course_id, prerequisite_text, display_order) VALUES ($1, $2, $3)',
          [courseId, typeof prereq === 'string' ? prereq : prereq.prerequisite_text, i]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Return the updated course
    res.json({
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      price: updatedCourse.price,
      originalPrice: updatedCourse.original_price,
      duration: updatedCourse.duration,
      level: updatedCourse.level,
      category: updatedCourse.category,
      status: updatedCourse.status,
      thumbnail: updatedCourse.thumbnail,
      courseType: updatedCourse.course_type,
      createdAt: updatedCourse.created_at,
      updatedAt: updatedCourse.updated_at,
      features: courseData.features || [],
      tags: courseData.tags || [],
      objectives: courseData.objectives || [],
      prerequisites: courseData.prerequisites || []
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  } finally {
    client.release();
  }
});

// Update course features
router.put('/courses/:id/features', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const courseId = parseInt(req.params.id);
    const { features } = req.body;
    
    // Check if user owns the course
    const courseResult = await client.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (courseResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await client.query('BEGIN');
    
    // Delete existing features
    await client.query('DELETE FROM course_features WHERE course_id = $1', [courseId]);
    
    // Add new features
    const newFeatures = [];
    for (let i = 0; i < features.length; i++) {
      const result = await client.query(
        'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3) RETURNING *',
        [courseId, features[i], i]
      );
      newFeatures.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    res.json(newFeatures);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating features:', error);
    res.status(500).json({ error: 'Failed to update features' });
  } finally {
    client.release();
  }
});

// Add course module
router.post('/courses/:id/modules', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, display_order, duration_minutes } = req.body;
    
    // Check ownership
    const courseResult = await db.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (courseResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await db.query(`
      INSERT INTO course_modules (course_id, title, description, display_order, duration_minutes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [courseId, title, description, display_order || 0, duration_minutes]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Add lesson to module
router.post('/modules/:moduleId/lessons', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const { title, description, content_type, content_url, duration_minutes, display_order, is_preview } = req.body;
    
    // Check ownership through module -> course
    const ownershipResult = await db.query(`
      SELECT c.instructor_id 
      FROM course_modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1
    `, [moduleId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    if (ownershipResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await db.query(`
      INSERT INTO course_lessons (
        module_id, title, description, content_type, 
        content_url, duration_minutes, display_order, is_preview
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      moduleId, title, description, content_type,
      content_url, duration_minutes, display_order || 0, is_preview || false
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Add course review
router.post('/courses/:id/reviews', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user?.id;
    const { rating, title, comment } = req.body;
    
    // Check if user has enrolled in the course
    const enrollmentResult = await db.query(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    
    if (enrollmentResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be enrolled in the course to review it' });
    }
    
    // Check if user already reviewed this course
    const existingReview = await db.query(
      'SELECT id FROM course_reviews WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this course' });
    }
    
    const result = await db.query(`
      INSERT INTO course_reviews (course_id, user_id, rating, title, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [courseId, userId, rating, title, comment]);
    
    // Update course rating
    await db.query(`
      UPDATE courses 
      SET rating = (
        SELECT AVG(rating) FROM course_reviews WHERE course_id = $1
      )
      WHERE id = $1
    `, [courseId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Search courses with normalized data
router.get('/courses/search', async (req, res) => {
  try {
    const { q, category, level, priceMin, priceMax, rating, tags } = req.query;
    
    let query = `
      SELECT DISTINCT c.*, p.full_name as instructor_name, p.avatar_url as instructor_avatar,
             array_agg(DISTINCT cf.feature) as features,
             array_agg(DISTINCT ct.tag) as tags
      FROM courses c
      JOIN profiles p ON c.instructor_id = p.id
      LEFT JOIN course_features cf ON c.id = cf.course_id
      LEFT JOIN course_tags ct ON c.id = ct.course_id
      WHERE c.status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (q) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    
    if (category) {
      query += ` AND c.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (level) {
      query += ` AND c.level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }
    
    if (priceMin) {
      query += ` AND c.price >= $${paramIndex}`;
      params.push(priceMin);
      paramIndex++;
    }
    
    if (priceMax) {
      query += ` AND c.price <= $${paramIndex}`;
      params.push(priceMax);
      paramIndex++;
    }
    
    if (rating) {
      query += ` AND c.rating >= $${paramIndex}`;
      params.push(rating);
      paramIndex++;
    }
    
    if (tags) {
      const tagArray = tags.toString().split(',');
      query += ` AND EXISTS (
        SELECT 1 FROM course_tags ct2 
        WHERE ct2.course_id = c.id 
        AND ct2.tag = ANY($${paramIndex}::text[])
      )`;
      params.push(tagArray);
      paramIndex++;
    }
    
    query += ` GROUP BY c.id, p.full_name, p.avatar_url ORDER BY c.created_at DESC`;
    
    const result = await db.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching courses:', error);
    res.status(500).json({ error: 'Failed to search courses' });
  }
});

// Get lesson progress for enrollment
router.get('/enrollments/:enrollmentId/progress', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const enrollmentId = parseInt(req.params.enrollmentId);
    
    // Verify user owns this enrollment
    const enrollmentResult = await db.query(
      'SELECT user_id FROM enrollments WHERE id = $1',
      [enrollmentId]
    );
    
    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    if (enrollmentResult.rows[0].user_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const progressResult = await db.query(`
      SELECT lp.*, cl.title as lesson_title, cm.title as module_title
      FROM lesson_progress lp
      JOIN course_lessons cl ON lp.lesson_id = cl.id
      JOIN course_modules cm ON cl.module_id = cm.id
      WHERE lp.enrollment_id = $1
      ORDER BY cm.display_order, cl.display_order
    `, [enrollmentId]);
    
    res.json(progressResult.rows);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update course module
router.put('/courses/:courseId/modules/:moduleId', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    const { title, description, display_order, duration_minutes } = req.body;
    
    // Check ownership
    const ownershipResult = await client.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (ownershipResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Verify module belongs to course
    const moduleCheck = await client.query(
      'SELECT id FROM course_modules WHERE id = $1 AND course_id = $2',
      [moduleId, courseId]
    );
    
    if (moduleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found in this course' });
    }
    
    const result = await client.query(`
      UPDATE course_modules 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        display_order = COALESCE($3, display_order),
        duration_minutes = COALESCE($4, duration_minutes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND course_id = $6
      RETURNING *
    `, [title, description, display_order, duration_minutes, moduleId, courseId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  } finally {
    client.release();
  }
});

// Update course lesson
router.put('/modules/:moduleId/lessons/:lessonId', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    const { title, description, content_type, content_url, duration_minutes, display_order, is_preview } = req.body;
    
    // Check ownership through module -> course
    const ownershipResult = await client.query(`
      SELECT c.instructor_id 
      FROM course_modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1
    `, [moduleId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    if (ownershipResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Verify lesson belongs to module
    const lessonCheck = await client.query(
      'SELECT id FROM course_lessons WHERE id = $1 AND module_id = $2',
      [lessonId, moduleId]
    );
    
    if (lessonCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found in this module' });
    }
    
    const result = await client.query(`
      UPDATE course_lessons 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        content_type = COALESCE($3, content_type),
        content_url = COALESCE($4, content_url),
        duration_minutes = COALESCE($5, duration_minutes),
        display_order = COALESCE($6, display_order),
        is_preview = COALESCE($7, is_preview),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 AND module_id = $9
      RETURNING *
    `, [title, description, content_type, content_url, duration_minutes, display_order, is_preview, lessonId, moduleId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  } finally {
    client.release();
  }
});

// Delete course module
router.delete('/courses/:courseId/modules/:moduleId', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const courseId = parseInt(req.params.courseId);
    const moduleId = parseInt(req.params.moduleId);
    
    // Check ownership
    const ownershipResult = await client.query(
      'SELECT instructor_id FROM courses WHERE id = $1',
      [courseId]
    );
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    if (ownershipResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete module (lessons will cascade delete)
    await client.query(
      'DELETE FROM course_modules WHERE id = $1 AND course_id = $2',
      [moduleId, courseId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  } finally {
    client.release();
  }
});

// Delete course lesson
router.delete('/modules/:moduleId/lessons/:lessonId', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessonId = parseInt(req.params.lessonId);
    
    // Check ownership through module -> course
    const ownershipResult = await client.query(`
      SELECT c.instructor_id 
      FROM course_modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1
    `, [moduleId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    if (ownershipResult.rows[0].instructor_id !== req.user?.id && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete lesson
    await client.query(
      'DELETE FROM course_lessons WHERE id = $1 AND module_id = $2',
      [lessonId, moduleId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  } finally {
    client.release();
  }
});

// Update lesson progress
router.put('/lesson-progress/:lessonId', authenticateToken, async (req: AuthRequest, res) => {
  const client = await db.connect();
  
  try {
    const lessonId = parseInt(req.params.lessonId);
    const { status, time_spent_minutes } = req.body;
    const userId = req.user?.id;
    
    // Find enrollment
    const enrollmentResult = await client.query(`
      SELECT e.id 
      FROM enrollments e
      JOIN course_modules cm ON e.course_id = cm.course_id
      JOIN course_lessons cl ON cm.id = cl.module_id
      WHERE e.user_id = $1 AND cl.id = $2
    `, [userId, lessonId]);
    
    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    const enrollmentId = enrollmentResult.rows[0].id;
    
    await client.query('BEGIN');
    
    // Update or insert lesson progress
    const result = await client.query(`
      INSERT INTO lesson_progress (enrollment_id, lesson_id, status, time_spent_minutes, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (enrollment_id, lesson_id)
      DO UPDATE SET 
        status = $3,
        time_spent_minutes = COALESCE(lesson_progress.time_spent_minutes, 0) + $4,
        completed_at = $5,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      enrollmentId,
      lessonId,
      status,
      time_spent_minutes || 0,
      status === 'completed' ? new Date() : null
    ]);
    
    // Update overall course progress
    const progressResult = await client.query(`
      SELECT 
        COUNT(DISTINCT cl.id) as total_lessons,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed') as completed_lessons
      FROM course_modules cm
      JOIN course_lessons cl ON cm.id = cl.module_id
      LEFT JOIN lesson_progress lp ON cl.id = lp.lesson_id AND lp.enrollment_id = $1
      WHERE cm.course_id = (SELECT course_id FROM enrollments WHERE id = $1)
    `, [enrollmentId]);
    
    const { total_lessons, completed_lessons } = progressResult.rows[0];
    const progress = total_lessons > 0 ? (completed_lessons / total_lessons) * 100 : 0;
    
    await client.query(
      'UPDATE enrollments SET progress = $1, status = $2 WHERE id = $3',
      [progress, progress === 100 ? 'completed' : 'active', enrollmentId]
    );
    
    await client.query('COMMIT');
    
    res.json({
      lessonProgress: result.rows[0],
      courseProgress: progress
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  } finally {
    client.release();
  }
});

export default router;
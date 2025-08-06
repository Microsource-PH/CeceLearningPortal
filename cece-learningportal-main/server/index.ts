import express from 'express';
import cors from 'cors';
import { PostgresService } from './postgresService';
import { authenticateToken, AuthRequest } from './middleware/auth';
import courseRoutes from './routes/courses';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Mount course routes
app.use('/api', courseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const result = await PostgresService.register(email, password, fullName, role);
  
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json(result.data);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await PostgresService.login(email, password);
  
  if (result.error) {
    return res.status(401).json({ error: result.error });
  }
  
  res.json(result.data);
});

// User profile routes
app.get('/api/users/:id/profile', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const requestedUserId = req.params.id;
  
  // Users can only access their own profile, or admin can access any profile
  if (userId !== requestedUserId && req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const result = await PostgresService.getUserProfile(requestedUserId);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const profile = result.data;
  res.json({
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    avatar: profile.avatar_url,
    bio: profile.bio,
    location: profile.location,
    phoneNumber: profile.phone_number,
    socialLinks: profile.social_links,
    status: profile.status,
    createdAt: profile.created_at,
    lastLogin: profile.last_login
  });
});

app.put('/api/users/:id/profile', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const requestedUserId = req.params.id;
  
  // Users can only update their own profile
  if (userId !== requestedUserId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // TODO: Implement profile update
  res.json({ message: 'Profile update not implemented yet' });
});

// User stats routes
app.get('/api/users/:id/stats', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const requestedUserId = req.params.id;
  
  // Users can only access their own stats, or admin can access any stats
  if (userId !== requestedUserId && req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const result = await PostgresService.getUserStats(requestedUserId);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const stats = result.data;
  res.json({
    totalCourses: stats.total_courses,
    completedCourses: stats.completed_courses,
    inProgressCourses: stats.in_progress_courses,
    totalHours: stats.total_hours,
    certificates: stats.certificates,
    averageScore: stats.average_score,
    currentStreak: stats.current_streak,
    longestStreak: stats.longest_streak
  });
});

// Certificates routes
app.get('/api/users/:id/certificates', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const requestedUserId = req.params.id;
  
  // Users can only access their own certificates, or admin can access any certificates
  if (userId !== requestedUserId && req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const result = await PostgresService.getUserCertificates(requestedUserId);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const certificates = result.data.map((cert: any) => ({
    id: cert.id,
    title: cert.course_title || 'Unknown Course',
    issueDate: cert.issued_at,
    credentialId: cert.credential_id,
    validUntil: cert.valid_until,
    issuer: 'Cece Learning Portal',
    courseId: cert.course_id,
    grade: cert.grade,
    skills: cert.skills
  }));
  
  res.json(certificates);
});

// Activity routes
app.get('/api/users/:id/activity', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const requestedUserId = req.params.id;
  
  // Users can only access their own activity, or admin can access any activity
  if (userId !== requestedUserId && req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const result = await PostgresService.getUserActivities(requestedUserId);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const activities = result.data.map((activity: any) => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    date: activity.created_at,
    courseId: activity.course_id,
    courseName: activity.course_title,
    details: activity.details
  }));
  
  res.json(activities);
});

// Instructor stats routes
app.get('/api/users/:id/instructor-stats', async (req, res) => {
  const result = await PostgresService.getInstructorStats(req.params.id);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Admin stats routes
app.get('/api/admin/stats', async (req, res) => {
  const result = await PostgresService.getPlatformStats();
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Admin users routes
app.get('/api/admin/users', authenticateToken, async (req: AuthRequest, res) => {
  // Check if user is admin
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  const result = await PostgresService.getAllUsers();
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const users = result.data.map((user: any) => ({
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar_url || `https://api.dicebear.com/7.x/personas/svg?seed=${user.email}`,
    joinedDate: user.created_at,
    lastActive: user.last_login || user.created_at,
    coursesEnrolled: user.courses_enrolled || 0,
    coursesCompleted: user.courses_completed || 0,
    totalSpent: user.total_spent || 0,
    phone: user.phone_number,
    location: user.location,
    company: user.company
  }));
  
  res.json(users);
});

// Admin user subscription routes
app.get('/api/admin/users/:userId/subscription', authenticateToken, async (req: AuthRequest, res) => {
  // Check if user is admin
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  const userId = req.params.userId;
  const result = await PostgresService.getCurrentSubscription(userId);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  // Return subscription info in expected format
  res.json({
    hasSubscription: !!result.data,
    subscription: result.data ? {
      id: result.data.id,
      plan: result.data.plan || 'Basic',
      planId: result.data.planId,
      status: result.data.status || 'Active',
      expiresAt: result.data.endDate,
      billingCycle: 'Monthly',
      amount: result.data.amount,
      nextBillingDate: result.data.endDate,
      startDate: result.data.startDate
    } : null
  });
});

// Admin subscription plans routes
app.get('/api/admin/subscription-plans', authenticateToken, async (req: AuthRequest, res) => {
  // Check if user is admin
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  // Return mock subscription plans for now
  const plans = [
    {
      id: '1',
      name: 'Learner Basic',
      type: 'learner',
      price: 999,
      yearlyPrice: 9999,
      billingCycle: 'Monthly',
      features: ['Access to 5 courses per month', 'Community forum access', 'Email support']
    },
    {
      id: '2', 
      name: 'Learner Pro',
      type: 'learner',
      price: 1999,
      yearlyPrice: 19999,
      billingCycle: 'Monthly',
      features: ['Unlimited course access', 'Priority support', 'Downloadable resources', 'Certificate of completion']
    },
    {
      id: '3',
      name: 'Creator Starter',
      type: 'creator',
      price: 2999,
      yearlyPrice: 29999,
      billingCycle: 'Monthly',
      features: ['Host up to 5 courses', 'Basic analytics', 'Standard payment processing']
    },
    {
      id: '4',
      name: 'Creator Pro',
      type: 'creator', 
      price: 4999,
      yearlyPrice: 49999,
      billingCycle: 'Monthly',
      features: ['Unlimited courses', 'Advanced analytics', 'Priority payment processing', 'Marketing tools']
    }
  ];
  
  res.json(plans);
});

// Course routes
app.get('/api/courses', async (req, res) => {
  const filters = {
    status: req.query.status as string,
    instructor_id: req.query.instructorId as string,
    category: req.query.category as string
  };
  
  const result = await PostgresService.getCourses(filters);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const courses = result.data.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.instructor_name,
    instructorId: course.instructor_id,
    price: course.price,
    originalPrice: course.original_price,
    discount: course.original_price ? Math.round((1 - course.price / course.original_price) * 100) : 0,
    duration: course.duration,
    level: course.level,
    category: course.category,
    status: course.status,
    thumbnail: course.thumbnail,
    rating: parseFloat(course.average_rating) || 4.5,
    studentsCount: parseInt(course.enrolled_students) || 0,
    features: course.features || [],
    enrollmentType: course.enrollment_type || 'OneTime',
    isBestseller: course.is_bestseller || false,
    courseType: course.course_type,
    createdAt: course.created_at,
    updatedAt: course.updated_at
  }));
  
  res.json(courses);
});

app.get('/api/courses/:id', async (req, res) => {
  const result = await PostgresService.getCourse(parseInt(req.params.id));
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Student routes
app.get('/api/students/stats', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getStudentStats(userId);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result.data);
});

app.get('/api/students/courses', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getEnrolledCourses(userId);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Subscription routes
app.get('/api/subscriptions/current', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getCurrentSubscription(userId);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Enrollment routes
app.get('/api/enrollments', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getEnrollments(userId);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const enrollments = result.data.map((enrollment: any) => ({
    id: enrollment.id,
    courseId: enrollment.course_id,
    userId: enrollment.user_id,
    status: enrollment.status,
    progress: enrollment.progress,
    progressPercentage: enrollment.progress,
    enrolledAt: enrollment.enrolled_at,
    completedAt: enrollment.completed_at,
    courseTitle: enrollment.title,
    courseDescription: enrollment.description,
    courseThumbnail: enrollment.thumbnail,
    courseCategory: enrollment.category,
    courseLevel: enrollment.level,
    courseDuration: enrollment.duration,
    instructorName: enrollment.instructor_name
  }));
  
  res.json(enrollments);
});

app.post('/api/enrollments/courses/:courseId', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.enrollInCourse(userId, parseInt(req.params.courseId));
  
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Course progress routes
app.get('/api/students/courses/:courseId/progress', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const courseId = parseInt(req.params.courseId);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getCourseProgress(userId, courseId);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Lesson progress routes
app.put('/api/students/lessons/:lessonId/progress', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const lessonId = parseInt(req.params.lessonId);
  const { status } = req.body;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.updateLessonProgress(userId, lessonId, status);
  
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  
  res.json({ success: true });
});

// Learning activity routes
app.get('/api/students/activity', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit as string) || 10;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getLearningActivity(userId, limit);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Student certificates routes
app.get('/api/students/certificates', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const result = await PostgresService.getUserCertificates(userId);
  
  if (result.error) {
    return res.status(404).json({ error: result.error });
  }
  
  res.json(result.data);
});

// Marketplace routes - show available courses for any user
app.get('/api/marketplace/courses', async (req, res) => {
  const filters = {
    status: 'active',
    category: req.query.category as string,
    search: req.query.search as string
  };
  
  const result = await PostgresService.getMarketplaceCourses(filters);
  
  if (result.error) {
    return res.status(500).json({ error: result.error });
  }
  
  // Transform data to match frontend expectations
  const courses = result.data.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.instructor_name,
    instructorId: course.instructor_id,
    price: course.price,
    originalPrice: course.original_price,
    discount: course.original_price ? Math.round((1 - course.price / course.original_price) * 100) : 0,
    duration: course.duration,
    level: course.level,
    category: course.category,
    status: course.status,
    thumbnail: course.thumbnail,
    rating: parseFloat(course.average_rating) || 0,
    studentsCount: parseInt(course.enrolled_students) || 0,
    features: course.features || [],
    tags: course.tags || [],
    enrollmentType: course.enrollment_type || 'OneTime',
    isBestseller: course.is_bestseller || false,
    courseType: course.course_type,
    createdAt: course.created_at,
    updatedAt: course.updated_at
  }));
  
  res.json(courses);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
// Database types matching the normalized schema

export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone_number?: string;
  role: 'Learner' | 'Creator' | 'Admin';
  status?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  original_price?: number;
  category: string;
  category_id?: number;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail?: string;
  status?: 'active' | 'draft' | 'pending' | 'inactive';
  rating?: number;
  total_students?: number;
  total_revenue?: number;
  course_type?: 'Sprint' | 'Marathon' | 'Membership' | 'Custom';
  is_featured?: boolean;
  enrollment_limit?: number;
  language?: string;
  subtitle_languages?: string[];
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CourseFeature {
  id: number;
  course_id: number;
  feature: string;
  display_order: number;
  created_at: Date;
}

export interface CourseTag {
  id: number;
  course_id: number;
  tag: string;
  created_at: Date;
}

export interface CoursePrerequisite {
  id: number;
  course_id: number;
  prerequisite_course_id?: number;
  prerequisite_text?: string;
  display_order: number;
  created_at: Date;
}

export interface CourseObjective {
  id: number;
  course_id: number;
  objective: string;
  display_order: number;
  created_at: Date;
}

export interface CourseInstructor {
  id: number;
  course_id: number;
  instructor_id: string;
  role?: string;
  created_at: Date;
}

export interface CourseModule {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  display_order: number;
  duration_minutes?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseLesson {
  id: number;
  module_id: number;
  title: string;
  description?: string;
  content_type?: 'video' | 'text' | 'quiz' | 'assignment' | 'resource';
  content_url?: string;
  duration_minutes?: number;
  display_order: number;
  is_preview?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LessonProgress {
  id: number;
  enrollment_id: number;
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at?: Date;
  time_spent_minutes?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseResource {
  id: number;
  course_id: number;
  lesson_id?: number;
  title: string;
  description?: string;
  resource_type: 'pdf' | 'video' | 'link' | 'download' | 'external';
  resource_url: string;
  file_size_bytes?: bigint;
  display_order: number;
  created_at: Date;
}

export interface CourseReview {
  id: number;
  course_id: number;
  user_id: string;
  rating: number;
  title?: string;
  comment?: string;
  helpful_count?: number;
  verified_purchase?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewResponse {
  id: number;
  review_id: number;
  instructor_id: string;
  response: string;
  created_at: Date;
}

export interface CourseAnnouncement {
  id: number;
  course_id: number;
  instructor_id: string;
  title: string;
  content: string;
  is_pinned?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  description?: string;
  icon?: string;
  display_order: number;
  is_active?: boolean;
  created_at: Date;
}

export interface Enrollment {
  id: number;
  user_id: string;
  course_id: number;
  enrolled_at: Date;
  progress?: number;
  status?: 'active' | 'completed' | 'dropped';
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  user_id: string;
  course_id?: number;
  amount: number;
  type: 'course_purchase' | 'subscription';
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: number;
  user_id: string;
  plan_id: string;
  status?: 'active' | 'cancelled' | 'expired';
  amount: number;
  start_date: Date;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  user_id: string;
  total_courses?: number;
  completed_courses?: number;
  in_progress_courses?: number;
  total_hours?: number;
  certificates?: number;
  average_score?: number;
  current_streak?: number;
  longest_streak?: number;
  updated_at: Date;
}

export interface InstructorStats {
  user_id: string;
  total_students?: number;
  active_courses?: number;
  total_revenue?: number;
  average_rating?: number;
  completion_rate?: number;
  student_satisfaction?: number;
  updated_at: Date;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: number;
  issued_at: Date;
  credential_id: string;
  valid_until?: Date;
  grade?: string;
}

export interface CertificateSkill {
  id: number;
  certificate_id: string;
  skill: string;
  created_at: Date;
}

export interface UserSkill {
  id: number;
  user_id: string;
  skill: string;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified?: boolean;
  created_at: Date;
}

export interface ProfileSocialLink {
  id: number;
  profile_id: string;
  platform: string;
  url: string;
  created_at: Date;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  course_id?: number;
  details?: any;
  created_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
}

// Composite types for API responses
export interface CourseWithDetails extends Course {
  features?: CourseFeature[];
  tags?: CourseTag[];
  prerequisites?: CoursePrerequisite[];
  objectives?: CourseObjective[];
  modules?: CourseModuleWithLessons[];
  instructors?: CourseInstructorWithProfile[];
  reviews?: CourseReviewWithUser[];
  category_details?: CourseCategory;
}

export interface CourseModuleWithLessons extends CourseModule {
  lessons?: CourseLesson[];
}

export interface CourseInstructorWithProfile extends CourseInstructor {
  profile?: Profile;
}

export interface CourseReviewWithUser extends CourseReview {
  user?: Profile;
  response?: ReviewResponse;
}

export interface EnrollmentWithProgress extends Enrollment {
  course?: Course;
  lesson_progress?: LessonProgress[];
}

export interface ProfileWithLinks extends Profile {
  social_links?: ProfileSocialLink[];
  skills?: UserSkill[];
}

export interface CertificateWithSkills extends Certificate {
  skills?: CertificateSkill[];
  course?: Course;
}
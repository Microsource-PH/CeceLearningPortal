import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import courseService from '@/services/courseService';
import learningTrackingService from '@/services/learningTrackingService';

export const useEnrollment = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);

  const enrollInCourse = async (courseId: number, courseName: string, price: number, enrollmentType: 'purchase' | 'subscription' = 'purchase') => {
    if (!isAuthenticated) {
      navigate('/login');
      return { success: false, error: 'Please login to enroll' };
    }

    try {
      setEnrolling(true);
      const response = await courseService.enrollInCourse(courseId);
      
      if (response.error && !response.error.includes('404')) {
        return { success: false, error: response.error };
      }

      // Track enrollment locally
      const enrollmentData = {
        id: Date.now(),
        courseId,
        title: courseName,
        instructor: 'Instructor',
        thumbnail: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=400&h=250&fit=crop&auto=format`,
        progress: 0,
        status: 'not_started',
        enrolledAt: new Date().toISOString(),
        completedLessons: 0,
        totalLessons: 10,
        lastAccessedAt: new Date().toISOString(),
        enrollmentType,
        price: enrollmentType === 'purchase' ? price : 0
      };

      // Store in localStorage
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      const existingIndex = enrolledCourses.findIndex((c: any) => c.courseId === courseId);
      
      if (existingIndex >= 0) {
        enrolledCourses[existingIndex] = { ...enrolledCourses[existingIndex], ...enrollmentData };
      } else {
        enrolledCourses.push(enrollmentData);
      }
      
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));

      // Track purchase if it's a direct purchase
      if (enrollmentType === 'purchase') {
        const purchases = JSON.parse(localStorage.getItem('coursePurchases') || '[]');
        purchases.push({
          courseId,
          courseName,
          amount: price,
          purchasedAt: new Date().toISOString()
        });
        localStorage.setItem('coursePurchases', JSON.stringify(purchases));
      }

      // Initialize course progress
      await learningTrackingService.updateCourseProgress(courseId, {
        overallProgress: 0,
        status: 'not_started',
        enrolledAt: new Date().toISOString(),
        totalTimeSpent: 0,
        lessonsCompleted: 0,
        totalLessons: 10,
        certificateEarned: false,
        lastAccessedAt: new Date().toISOString(),
        streak: 0
      });

      return { success: true, data: enrollmentData };
    } catch (error) {
      console.error('Enrollment error:', error);
      return { success: false, error: 'Failed to enroll in course' };
    } finally {
      setEnrolling(false);
    }
  };

  const startCourse = async (courseId: number) => {
    try {
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      const courseIndex = enrolledCourses.findIndex((c: any) => c.courseId === courseId);
      
      if (courseIndex >= 0) {
        enrolledCourses[courseIndex].status = 'in_progress';
        enrolledCourses[courseIndex].startedAt = new Date().toISOString();
        enrolledCourses[courseIndex].lastAccessedAt = new Date().toISOString();
        
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
        
        // Update course progress
        await learningTrackingService.updateCourseProgress(courseId, {
          status: 'in_progress',
          startedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString()
        });

        return { success: true };
      }
      
      return { success: false, error: 'Course not found in enrollment' };
    } catch (error) {
      console.error('Error starting course:', error);
      return { success: false, error: 'Failed to start course' };
    }
  };

  const markLessonComplete = async (courseId: number, lessonId: number, timeSpent: number, quizScore?: number) => {
    try {
      const result = await learningTrackingService.markLessonComplete(lessonId, courseId, timeSpent, quizScore);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      // Update local storage
      const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
      const courseIndex = enrolledCourses.findIndex((c: any) => c.courseId === courseId);
      
      if (courseIndex >= 0) {
        const course = enrolledCourses[courseIndex];
        course.completedLessons = (course.completedLessons || 0) + 1;
        course.progress = Math.round((course.completedLessons / course.totalLessons) * 100);
        course.timeSpent = (course.timeSpent || 0) + timeSpent;
        course.lastAccessedAt = new Date().toISOString();
        
        if (course.progress >= 100) {
          course.status = 'completed';
          course.completedAt = new Date().toISOString();
        }
        
        localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      return { success: false, error: 'Failed to mark lesson complete' };
    }
  };

  return {
    enrollInCourse,
    startCourse,
    markLessonComplete,
    enrolling
  };
};
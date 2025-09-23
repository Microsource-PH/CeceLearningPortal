import api from './api';

export interface UploadResponse {
  url: string;
  storageKey: string;
  size: number;
  mimeType: string;
  courseId: number;
  lessonId?: number;
}

export interface CourseResourceUploadParams {
  file: File;
  courseId: number;
  lessonId?: number;
  attach?: 'lessonVideo' | 'promoVideo' | 'thumbnail';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class UploadService {
  /**
   * Upload a course resource file with optional attachment to course/lesson
   */
  async uploadCourseResource(
    params: CourseResourceUploadParams,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: UploadResponse | null; error: string | null }> {
    try {
      const formData = new FormData();
      formData.append('file', params.file);
      formData.append('courseId', params.courseId.toString());

      if (params.lessonId) {
        formData.append('lessonId', params.lessonId.toString());
      }

      if (params.attach) {
        formData.append('attach', params.attach);
      }

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        // Handle upload progress
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress: UploadProgress = {
                loaded: event.loaded,
                total: event.total,
                percentage: Math.round((event.loaded / event.total) * 100)
              };
              onProgress(progress);
            }
          });
        }

        // Handle response
        xhr.addEventListener('load', () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve({ data: response, error: null });
            } else {
              let errorMessage = `Upload failed with status ${xhr.status}`;
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                errorMessage = errorResponse.message || errorResponse.error || errorMessage;
              } catch {
                // Use default error message
              }
              resolve({ data: null, error: errorMessage });
            }
          } catch (error) {
            resolve({ data: null, error: 'Failed to parse response' });
          }
        });

        // Handle network errors
        xhr.addEventListener('error', () => {
          resolve({ data: null, error: 'Network error occurred during upload' });
        });

        // Handle timeout
        xhr.addEventListener('timeout', () => {
          resolve({ data: null, error: 'Upload timeout' });
        });

        // Get auth token
        const token = localStorage.getItem('token');

        // Setup request
        xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:5294'}/api/uploads/course-resource`);

        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        // Set timeout (30 seconds for large files)
        xhr.timeout = 30000;

        // Send request
        xhr.send(formData);
      });
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Upload thumbnail for a course
   */
  async uploadCourseThumbnail(
    courseId: number,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: UploadResponse | null; error: string | null }> {
    return this.uploadCourseResource({
      file,
      courseId,
      attach: 'thumbnail'
    }, onProgress);
  }

  /**
   * Upload promo video for a course
   */
  async uploadPromoVideo(
    courseId: number,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: UploadResponse | null; error: string | null }> {
    return this.uploadCourseResource({
      file,
      courseId,
      attach: 'promoVideo'
    }, onProgress);
  }

  /**
   * Upload lesson video
   */
  async uploadLessonVideo(
    courseId: number,
    lessonId: number,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: UploadResponse | null; error: string | null }> {
    return this.uploadCourseResource({
      file,
      courseId,
      lessonId,
      attach: 'lessonVideo'
    }, onProgress);
  }

  /**
   * Upload general course resource (document, etc.)
   */
  async uploadCourseDocument(
    courseId: number,
    file: File,
    lessonId?: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ data: UploadResponse | null; error: string | null }> {
    return this.uploadCourseResource({
      file,
      courseId,
      lessonId
    }, onProgress);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, type: 'video' | 'audio' | 'image' | 'document'): { valid: boolean; error?: string } {
    const maxSizes = {
      video: 500 * 1024 * 1024, // 500MB
      audio: 500 * 1024 * 1024, // 500MB
      image: 500 * 1024 * 1024, // 500MB
      document: 25 * 1024 * 1024 // 25MB
    };

    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
      audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/csv'
      ]
    };

    // Check file size
    if (file.size > maxSizes[type]) {
      const maxSizeMB = Math.round(maxSizes[type] / (1024 * 1024));
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`
      };
    }

    // Check file type
    if (!allowedTypes[type].includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes[type].join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Detect file type based on MIME type
   */
  detectFileType(file: File): 'video' | 'audio' | 'image' | 'document' {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    return 'document';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const uploadService = new UploadService();
export default uploadService;
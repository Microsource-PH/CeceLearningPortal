# Database Schema Normalization

## Overview

This document describes the normalization of the CeceLearningPortal database schema to properly implement one-to-many relationships and eliminate comma-separated values in columns.

## Changes Made

### 1. Course Features (Previously JSONB)
- **Old**: `courses.features` as JSONB array
- **New**: `course_features` table with one-to-many relationship
- **Benefits**: 
  - Easier to query and filter
  - Better indexing capabilities
  - Maintains display order
  - Prevents duplicate features

### 2. Course Structure
Added proper course structure with modules and lessons:
- `course_modules`: Organizes course content into sections
- `course_lessons`: Individual learning units within modules
- `lesson_progress`: Tracks student progress per lesson

### 3. Course Metadata
- `course_tags`: Flexible tagging system for categorization
- `course_prerequisites`: Links to other courses or text prerequisites
- `course_objectives`: Learning outcomes
- `course_categories`: Hierarchical category system

### 4. Reviews and Feedback
- `course_reviews`: Student reviews with ratings
- `review_responses`: Instructor responses to reviews
- `course_announcements`: Course-specific announcements

### 5. Resources and Materials
- `course_resources`: Downloadable materials and links
- Linked to courses or specific lessons

### 6. User Profile Normalization
- `profile_social_links`: Normalized from JSONB
- `user_skills`: Track user competencies
- `certificate_skills`: Skills earned from certificates

## Migration Steps

1. **Run the migration script**:
   ```bash
   npm run migrate:normalize
   ```

2. **Verify migration**:
   ```bash
   psql -d CeceLearningPortal -f migrations/002_normalize_schema.sql
   ```

3. **Generate sample data** (optional):
   ```bash
   npx ts-node scripts/run-normalization-migration.ts
   ```

## API Changes Required

### Course Creation
Before:
```json
{
  "title": "Course Title",
  "features": ["Feature 1", "Feature 2"],
  "tags": "tag1,tag2,tag3"
}
```

After:
```json
{
  "course": {
    "title": "Course Title"
  },
  "features": ["Feature 1", "Feature 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "objectives": ["Objective 1", "Objective 2"]
}
```

### Course Retrieval
The API now returns nested relationships:
```json
{
  "id": 1,
  "title": "Course Title",
  "features": [
    { "id": 1, "feature": "Feature 1", "display_order": 0 },
    { "id": 2, "feature": "Feature 2", "display_order": 1 }
  ],
  "tags": [
    { "id": 1, "tag": "tag1" },
    { "id": 2, "tag": "tag2" }
  ],
  "modules": [
    {
      "id": 1,
      "title": "Module 1",
      "lessons": [
        { "id": 1, "title": "Lesson 1", "content_type": "video" }
      ]
    }
  ]
}
```

## Frontend Updates Required

1. **Course Editor Component**
   - Update to handle array of features instead of comma-separated
   - Add UI for managing modules and lessons
   - Support for reordering items

2. **Course Display**
   - Update to display structured content
   - Show module/lesson hierarchy
   - Track progress per lesson

3. **Search and Filtering**
   - Update to search through normalized tags
   - Filter by multiple criteria

## Benefits of Normalization

1. **Data Integrity**: Foreign key constraints ensure referential integrity
2. **Query Performance**: Proper indexes on normalized tables
3. **Flexibility**: Easy to add/remove features without affecting other data
4. **Scalability**: Better performance with large datasets
5. **Maintainability**: Clear relationships between entities
6. **Reporting**: Easier to generate analytics and reports

## Rollback Plan

If needed, the original JSONB columns are preserved. To rollback:
1. Stop using the normalized tables
2. Ensure JSONB columns are up-to-date
3. Drop the new tables (see commented commands in migration)

## Future Enhancements

1. **Course Versioning**: Track changes to course content
2. **Collaborative Teaching**: Multiple instructors per course
3. **Learning Paths**: Sequence of courses
4. **Skill Assessments**: Link skills to assessments
5. **Content Localization**: Multi-language support
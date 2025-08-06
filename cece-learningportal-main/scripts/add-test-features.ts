import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'CeceLearningPortal',
  user: 'postgres',
  password: 'P@ssword!@'
});

async function addTestFeatures() {
  try {
    // Get all courses
    const coursesResult = await pool.query('SELECT id, title FROM courses LIMIT 10');
    const courses = coursesResult.rows;
    
    console.log(`Found ${courses.length} courses`);
    
    const sampleFeatures = [
      ['Lifetime access', 'Certificate of completion', 'Downloadable resources', 'Mobile access'],
      ['24/7 Support', 'Hands-on projects', 'Source code included', 'Regular updates'],
      ['Interactive exercises', 'Community forum access', 'Live Q&A sessions', 'Practical examples'],
      ['Self-paced learning', 'HD video content', 'English subtitles', 'Money-back guarantee']
    ];
    
    const sampleTags = [
      ['beginner-friendly', 'trending', 'bestseller'],
      ['advanced', 'professional', 'certification'],
      ['hands-on', 'project-based', 'practical'],
      ['comprehensive', 'updated', 'popular']
    ];
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const featureSet = sampleFeatures[i % sampleFeatures.length];
      const tagSet = sampleTags[i % sampleTags.length];
      
      console.log(`\nAdding features to course: ${course.title}`);
      
      // Add features
      for (let j = 0; j < featureSet.length; j++) {
        try {
          await pool.query(
            'INSERT INTO course_features (course_id, feature, display_order) VALUES ($1, $2, $3) ON CONFLICT (course_id, feature) DO NOTHING',
            [course.id, featureSet[j], j]
          );
          console.log(`  - Added feature: ${featureSet[j]}`);
        } catch (err) {
          console.error(`  - Error adding feature: ${err.message}`);
        }
      }
      
      // Add tags
      for (const tag of tagSet) {
        try {
          await pool.query(
            'INSERT INTO course_tags (course_id, tag) VALUES ($1, $2) ON CONFLICT (course_id, tag) DO NOTHING',
            [course.id, tag]
          );
          console.log(`  - Added tag: ${tag}`);
        } catch (err) {
          console.error(`  - Error adding tag: ${err.message}`);
        }
      }
      
      // Update course_type if not set
      const courseTypes = ['Sprint', 'Marathon', 'Membership', 'Custom'];
      const courseType = courseTypes[i % courseTypes.length];
      
      await pool.query(
        'UPDATE courses SET course_type = $1 WHERE id = $2 AND course_type IS NULL',
        [courseType, course.id]
      );
      console.log(`  - Set course type: ${courseType}`);
      
      // Set some courses as bestsellers (skip if column doesn't exist)
      // if (i % 3 === 0) {
      //   await pool.query(
      //     'UPDATE courses SET is_bestseller = true WHERE id = $1',
      //     [course.id]
      //   );
      //   console.log(`  - Marked as bestseller`);
      // }
    }
    
    console.log('\nTest features added successfully!');
    
  } catch (error) {
    console.error('Error adding test features:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addTestFeatures();
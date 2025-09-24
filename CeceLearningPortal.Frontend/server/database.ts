import { Pool } from 'pg';

// Parse connection string format from appsettings.json
function parseConnectionString(connStr: string) {
  const params: any = {};
  connStr.split(';').forEach(part => {
    const [key, value] = part.split('=');
    if (key && value) {
      params[key.trim()] = value.trim();
    }
  });
  return {
    host: params.Host || 'localhost',
    port: parseInt(params.Port || '5432'),
    database: params.Database || 'CeceLearningPortal',
    user: params.Username || params.User || 'postgres',
    password: params.Password || 'P@ssword!@'
  };
}

// Get connection configuration
let dbConfig: any;

try {
  // Try to read from appsettings.json if in Node environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = require('fs');
    const path = require('path');
    const appsettingsPath = path.join(process.cwd(), 'appsettings.json');
    const appsettings = JSON.parse(fs.readFileSync(appsettingsPath, 'utf8'));
    const connectionString = appsettings.ConnectionStrings.CeceLearningPortal;
    dbConfig = parseConnectionString(connectionString);
  }
} catch (error) {
  console.warn('Could not read appsettings.json, using defaults');
}

// Fallback to environment variable or defaults
if (!dbConfig) {
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'CeceLearningPortal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'P@ssword!@'
  };
}

// Create PostgreSQL connection pool
export const db = new Pool({
  ...dbConfig,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
db.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

db.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Database types matching our schema
export interface User {
  id: string;
  email: string;
  encrypted_password: string;
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
  status: string;
  social_links?: any;
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
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  status: 'active' | 'draft' | 'pending' | 'inactive';
  rating?: number;
  total_students?: number;
  total_revenue?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Enrollment {
  id: number;
  user_id: string;
  course_id: number;
  enrolled_at: Date;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
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
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: number;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  amount: number;
  start_date: Date;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Helper function to execute queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  try {
    const result = await db.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper function for single row queries
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
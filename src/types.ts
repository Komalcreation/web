/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Admin {
  username: string;
  role: string;
}

export interface Course {
  id: string;
  course_name_en: string;
  course_name_pa: string;
  description_en: string;
  description_pa: string;
  price: number;
  duration: string;
  created_at: string;
}

export interface Student {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  language_preference: 'en' | 'pa';
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  fee_status: 'Paid' | 'Pending' | 'Half Paid';
  status: 'Active' | 'Completed' | 'Dropped';
  created_at: string;
  // Included on fetch
  student_name?: string;
  course_name_en?: string;
  course_name_pa?: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issue_date: string;
  completion_status: 'Completed' | 'Excellent' | 'Grade A' | 'Grade B';
  verification_code: string;
  created_at: string;
  // Included on fetch
  student_name?: string;
  student_phone?: string;
  course_name_en?: string;
  course_name_pa?: string;
}

export interface GalleryItem {
  id: string;
  title_en: string;
  title_pa: string;
  image_url: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  message: string;
  created_at: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalEnrollments: number;
  totalCourses: number;
  totalMessages: number;
  totalCertificates: number;
}

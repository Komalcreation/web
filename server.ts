/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Type definitions matching those in src/types.ts for typing backend objects
interface DbSchema {
  admins: Array<{ username: string; password?: string }>;
  courses: Array<any>;
  students: Array<any>;
  enrollments: Array<any>;
  certificates: Array<any>;
  gallery: Array<any>;
  contact_messages: Array<any>;
}

const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Simple file database helper with read/write logic
async function readDb(): Promise<DbSchema> {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      // In case the DB is missing or deleted, seed a default structure
      const defaultDb: DbSchema = {
        admins: [{ username: 'admin', password: 'admin' }],
        courses: [],
        students: [],
        enrollments: [],
        certificates: [],
        gallery: [],
        contact_messages: []
      };
      await fs.promises.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
      await fs.promises.writeFile(DB_FILE_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const rawData = await fs.promises.readFile(DB_FILE_PATH, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Error reading database", err);
    return {
      admins: [{ username: 'admin', password: 'admin' }],
      courses: [],
      students: [],
      enrollments: [],
      certificates: [],
      gallery: [],
      contact_messages: []
    };
  }
}

async function writeDb(data: DbSchema): Promise<void> {
  try {
    await fs.promises.mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
    await fs.promises.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Admin Verification Middleware
  function verifyAdminToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized: Missing verification token.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    if (token === 'mock-admin-token-komal-creations' || token === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Invalid admin token.' });
    }
  }

  // ==========================================
  // PUBLIC API ENDPOINTS
  // ==========================================

  // Get active courses
  app.get('/api/public/courses', async (req, res) => {
    try {
      const db = await readDb();
      res.json(db.courses);
    } catch {
      res.status(500).json({ error: 'Failed to fetch courses.' });
    }
  });

  // Get gallery items
  app.get('/api/public/gallery', async (req, res) => {
    try {
      const db = await readDb();
      res.json(db.gallery);
    } catch {
      res.status(500).json({ error: 'Failed to fetch gallery.' });
    }
  });

  // Public Search/Verify Certificate Code
  app.get('/api/public/verify/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const db = await readDb();
      const cleanCode = code.trim().toUpperCase();
      
      const certificate = db.certificates.find(c => c.verification_code.trim().toUpperCase() === cleanCode);
      if (!certificate) {
        res.status(404).json({ error: 'Certificate not found. Please verify the code and try again.' });
        return;
      }

      // Fetch student details
      const student = db.students.find(s => s.id === certificate.student_id);
      // Fetch course details
      const course = db.courses.find(c => c.id === certificate.course_id);

      res.json({
        id: certificate.id,
        certificate_number: certificate.certificate_number,
        verification_code: certificate.verification_code,
        issue_date: certificate.issue_date,
        completion_status: certificate.completion_status,
        student_name: student ? student.full_name : 'Unknown Graduate',
        course_name_en: course ? course.course_name_en : 'Fashion Designing Course',
        course_name_pa: course ? course.course_name_pa : 'ਫੈਸ਼ਨ ਡਿਜ਼ਾਈਨਿੰਗ ਕੋਰਸ'
      });
    } catch {
      res.status(500).json({ error: 'Server error during certificate verification.' });
    }
  });

  // Public Student Enrollment Form
  app.post('/api/public/enroll', async (req, res) => {
    try {
      const { full_name, phone, email, address, course_id, language_preference } = req.body;

      if (!full_name || !phone || !course_id) {
        res.status(400).json({ error: 'Full Name, Phone Number, and Course selection are required.' });
        return;
      }

      const db = await readDb();

      // Check if course exists
      const courseExists = db.courses.some(c => c.id === course_id);
      if (!courseExists) {
        res.status(404).json({ error: 'Selected course does not exist.' });
        return;
      }

      // See if student already exists by phone
      let student = db.students.find(s => s.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''));
      
      if (!student) {
        // Create new student
        const studentId = 's_' + Math.random().toString(36).substr(2, 9);
        student = {
          id: studentId,
          full_name,
          phone,
          email: email || '',
          address: address || '',
          language_preference: language_preference === 'pa' ? 'pa' : 'en',
          created_at: new Date().toISOString()
        };
        db.students.push(student);
      }

      // Check if already enrolled in this course and status is active
      const alreadyEnrolled = db.enrollments.some(e => e.student_id === student.id && e.course_id === course_id && e.status === 'Active');
      if (alreadyEnrolled) {
        res.status(400).json({ error: 'You are already registered for this course with an active status.' });
        return;
      }

      // Create new enrollment
      const enrollmentId = 'e_' + Math.random().toString(36).substr(2, 9);
      const enrollment = {
        id: enrollmentId,
        student_id: student.id,
        course_id,
        enrollment_date: new Date().toISOString().split('T')[0],
        fee_status: 'Pending',
        status: 'Active',
        created_at: new Date().toISOString()
      };
      db.enrollments.push(enrollment);

      await writeDb(db);
      res.status(201).json({
        success: true,
        message: 'Successfully enrolled! Our team will contact you on WhatsApp/Phone shortly.',
        enrollmentId
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Enrollment processing failed.' });
    }
  });

  // Public Contact message submission
  app.post('/api/public/contact', async (req, res) => {
    try {
      const { full_name, phone, email, message } = req.body;
      if (!full_name || !phone || !message) {
        res.status(400).json({ error: 'Full Name, Phone number, and Message are required.' });
        return;
      }

      const db = await readDb();
      const messageId = 'm_' + Math.random().toString(36).substr(2, 9);
      const newMessage = {
        id: messageId,
        full_name,
        phone,
        email: email || '',
        message,
        created_at: new Date().toISOString()
      };

      db.contact_messages.push(newMessage);
      await writeDb(db);

      res.status(201).json({ success: true, message: 'Message sent successfully! We will get back to you shortly.' });
    } catch {
      res.status(500).json({ error: 'Failed to send message.' });
    }
  });


  // ==========================================
  // ADMIN AUTHENTICATION
  // ==========================================
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
         res.status(400).json({ error: 'Username and Password are required.' });
         return;
      }

      const db = await readDb();
      const validAdmin = db.admins.find(a => a.username.trim() === username.trim() && a.password === password);
      
      if (!validAdmin) {
        res.status(401).json({ error: 'Invalid admin username or password.' });
        return;
      }

      res.json({
        success: true,
        token: 'mock-admin-token-komal-creations',
        username: validAdmin.username,
        role: 'Administrator'
      });
    } catch {
      res.status(500).json({ error: 'Authentication engine failed.' });
    }
  });

  // ==========================================
  // SECURE ADMIN API ENDPOINTS (Token Verified)
  // ==========================================

  // Dashboard Stats Counts
  app.get('/api/admin/stats', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      res.json({
        totalStudents: db.students.length,
        totalEnrollments: db.enrollments.length,
        totalCourses: db.courses.length,
        totalMessages: db.contact_messages.length,
        totalCertificates: db.certificates.length
      });
    } catch {
      res.status(500).json({ error: 'Failed to fetch dashboard metrics.' });
    }
  });

  // --- Manage Courses ---
  app.get('/api/admin/courses', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      res.json(db.courses);
    } catch {
      res.status(500).json({ error: 'Failed to load courses.' });
    }
  });

  app.post('/api/admin/courses', verifyAdminToken, async (req, res) => {
    try {
      const { course_name_en, course_name_pa, description_en, description_pa, price, duration } = req.body;
      if (!course_name_en || !course_name_pa || !price || !duration) {
         res.status(400).json({ error: 'English Name, Punjabi Name, Fee and Duration are required.' });
         return;
      }

      const db = await readDb();
      const newCourse = {
        id: 'c_' + Math.random().toString(36).substr(2, 9),
        course_name_en,
        course_name_pa,
        description_en: description_en || '',
        description_pa: description_pa || '',
        price: Number(price),
        duration,
        created_at: new Date().toISOString()
      };

      db.courses.push(newCourse);
      await writeDb(db);
      res.status(201).json(newCourse);
    } catch {
      res.status(500).json({ error: 'Failed to add course.' });
    }
  });

  app.put('/api/admin/courses/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { course_name_en, course_name_pa, description_en, description_pa, price, duration } = req.body;

      const db = await readDb();
      const courseIndex = db.courses.findIndex(c => c.id === id);
      if (courseIndex === -1) {
         res.status(404).json({ error: 'Course not found.' });
         return;
      }

      db.courses[courseIndex] = {
        ...db.courses[courseIndex],
        course_name_en,
        course_name_pa,
        description_en: description_en || '',
        description_pa: description_pa || '',
        price: Number(price),
        duration
      };

      await writeDb(db);
      res.json(db.courses[courseIndex]);
    } catch {
      res.status(500).json({ error: 'Failed to update course.' });
    }
  });

  app.delete('/api/admin/courses/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();
      
      // Filter out course
      db.courses = db.courses.filter(c => c.id !== id);
      // Clean up enrollments linked to this course
      db.enrollments = db.enrollments.filter(e => e.course_id !== id);

      await writeDb(db);
      res.json({ success: true, message: 'Course and linked enrollments removed.' });
    } catch {
      res.status(500).json({ error: 'Failed to remove course.' });
    }
  });

  // --- Manage Students ---
  app.get('/api/admin/students', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      res.json(db.students);
    } catch {
      res.status(500).json({ error: 'Failed to fetch students.' });
    }
  });

  app.post('/api/admin/students', verifyAdminToken, async (req, res) => {
    try {
      const { full_name, phone, email, address, language_preference } = req.body;
      if (!full_name || !phone) {
         res.status(400).json({ error: 'Full name and Phone are required.' });
         return;
      }

      const db = await readDb();
      const newStudent = {
        id: 's_' + Math.random().toString(36).substr(2, 9),
        full_name,
        phone,
        email: email || '',
        address: address || '',
        language_preference: language_preference === 'pa' ? 'pa' : 'en',
        created_at: new Date().toISOString()
      };

      db.students.push(newStudent);
      await writeDb(db);
      res.status(201).json(newStudent);
    } catch {
      res.status(500).json({ error: 'Could not create student.' });
    }
  });

  app.put('/api/admin/students/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { full_name, phone, email, address, language_preference } = req.body;

      const db = await readDb();
      const index = db.students.findIndex(s => s.id === id);
      if (index === -1) {
         res.status(404).json({ error: 'Student not found.' });
         return;
      }

      db.students[index] = {
        ...db.students[index],
        full_name,
        phone,
        email: email || '',
        address: address || '',
        language_preference: language_preference === 'pa' ? 'pa' : 'en'
      };

      await writeDb(db);
      res.json(db.students[index]);
    } catch {
      res.status(500).json({ error: 'Could not update student.' });
    }
  });

  app.delete('/api/admin/students/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();

      db.students = db.students.filter(s => s.id !== id);
      db.enrollments = db.enrollments.filter(e => e.student_id !== id);
      db.certificates = db.certificates.filter(c => c.student_id !== id);

      await writeDb(db);
      res.json({ success: true, message: 'Student records deleted.' });
    } catch {
      res.status(500).json({ error: 'Could not remove student.' });
    }
  });

  // --- Manage Enrollments ---
  app.get('/api/admin/enrollments', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      const enriched = db.enrollments.map(e => {
        const stud = db.students.find(s => s.id === e.student_id);
        const cour = db.courses.find(c => c.id === e.course_id);
        return {
          ...e,
          student_name: stud ? stud.full_name : 'Deleted Student',
          student_phone: stud ? stud.phone : 'N/A',
          course_name_en: cour ? cour.course_name_en : 'Deleted Course',
          course_name_pa: cour ? cour.course_name_pa : 'ਲੁਪਤ ਕੋਰਸ'
        };
      });
      res.json(enriched);
    } catch {
      res.status(500).json({ error: 'Failed to list enrollments.' });
    }
  });

  app.post('/api/admin/enrollments', verifyAdminToken, async (req, res) => {
    try {
      const { student_id, course_id, fee_status, status } = req.body;
      if (!student_id || !course_id) {
         res.status(400).json({ error: 'Student ID and Course ID are required.' });
         return;
      }

      const db = await readDb();
      const newEnroll = {
        id: 'e_' + Math.random().toString(36).substr(2, 9),
        student_id,
        course_id,
        enrollment_date: new Date().toISOString().split('T')[0],
        fee_status: fee_status || 'Pending',
        status: status || 'Active',
        created_at: new Date().toISOString()
      };

      db.enrollments.push(newEnroll);
      await writeDb(db);
      res.status(201).json(newEnroll);
    } catch {
      res.status(500).json({ error: 'Could not create enrollment.' });
    }
  });

  app.put('/api/admin/enrollments/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { fee_status, status } = req.body;

      const db = await readDb();
      const idx = db.enrollments.findIndex(e => e.id === id);
      if (idx === -1) {
         res.status(404).json({ error: 'Enrollment files missing.' });
         return;
      }

      db.enrollments[idx] = {
        ...db.enrollments[idx],
        fee_status: fee_status || db.enrollments[idx].fee_status,
        status: status || db.enrollments[idx].status
      };

      await writeDb(db);
      res.json(db.enrollments[idx]);
    } catch {
      res.status(500).json({ error: 'Failed to update status.' });
    }
  });

  app.delete('/api/admin/enrollments/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();
      db.enrollments = db.enrollments.filter(e => e.id !== id);
      await writeDb(db);
      res.json({ success: true, message: 'Enrollment deleted.' });
    } catch {
      res.status(500).json({ error: 'Could not delete enrollment.' });
    }
  });

  // --- Manage Certificates ---
  app.get('/api/admin/certificates', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      const enriched = db.certificates.map(c => {
        const stud = db.students.find(s => s.id === c.student_id);
        const cour = db.courses.find(co => co.id === c.course_id);
        return {
          ...c,
          student_name: stud ? stud.full_name : 'Deleted Student',
          student_phone: stud ? stud.phone : 'N/A',
          course_name_en: cour ? cour.course_name_en : 'Deleted Course',
          course_name_pa: cour ? cour.course_name_pa : 'ਲੁਪਤ ਕੋਰਸ'
        };
      });
      res.json(enriched);
    } catch {
      res.status(500).json({ error: 'Failed to fetch certificates.' });
    }
  });

  // Create/Generate Certificate
  app.post('/api/admin/certificates', verifyAdminToken, async (req, res) => {
    try {
      const { student_id, course_id, completion_status } = req.body;
      if (!student_id || !course_id) {
         res.status(400).json({ error: 'Student ID and Course ID are required.' });
         return;
      }

      const db = await readDb();

      // Check if student exists
      const student = db.students.find(s => s.id === student_id);
      if (!student) {
         res.status(404).json({ error: 'Selected student does not exist.' });
         return;
      }

      // Check if course exists
      const course = db.courses.find(c => c.id === course_id);
      if (!course) {
         res.status(404).json({ error: 'Selected course does not exist.' });
         return;
      }

      // Check if certificate already exists for this student and course
      const exists = db.certificates.find(c => c.student_id === student_id && c.course_id === course_id);
      if (exists) {
         res.status(400).json({ error: 'A certificate has already been issued to this student for this course.' });
         return;
      }

      // Generate distinct certificate number and verification code
      const certNoValue = 'KC-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
      
      // Random uppercase Alphanumeric of length 7
      const hexChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let verifyVal = 'KCM';
      for (let i = 0; i < 4; i++) {
        verifyVal += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
      }

      const newCert = {
        id: 'cert_' + Math.random().toString(36).substr(2, 9),
        student_id,
        course_id,
        certificate_number: certNoValue,
        issue_date: new Date().toISOString().split('T')[0],
        completion_status: completion_status || 'Completed',
        verification_code: verifyVal,
        created_at: new Date().toISOString()
      };

      db.certificates.push(newCert);
      await writeDb(db);

      res.status(201).json(newCert);
    } catch {
      res.status(500).json({ error: 'Failed to generate certificate.' });
    }
  });

  app.delete('/api/admin/certificates/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();
      db.certificates = db.certificates.filter(c => c.id !== id);
      await writeDb(db);
      res.json({ success: true, message: 'Certificate index deleted.' });
    } catch {
      res.status(500).json({ error: 'Failed to delete certificate.' });
    }
  });

  // --- Manage Messages ---
  app.get('/api/admin/messages', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      res.json(db.contact_messages);
    } catch {
      res.status(500).json({ error: 'Failed to list messages.' });
    }
  });

  app.delete('/api/admin/messages/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();
      db.contact_messages = db.contact_messages.filter(m => m.id !== id);
      await writeDb(db);
      res.json({ success: true, message: 'Message removed from index.' });
    } catch {
      res.status(500).json({ error: 'Could not remove message.' });
    }
  });

  // --- Manage Gallery ---
  app.get('/api/admin/gallery', verifyAdminToken, async (req, res) => {
    try {
      const db = await readDb();
      res.json(db.gallery);
    } catch {
      res.status(500).json({ error: 'Failed to fetch gallery.' });
    }
  });

  app.post('/api/admin/gallery', verifyAdminToken, async (req, res) => {
    try {
      const { title_en, title_pa, image_url } = req.body;
      if (!title_en || !title_pa || !image_url) {
         res.status(400).json({ error: 'English Title, Punjabi Title and Web Image URL are required.' });
         return;
      }

      const db = await readDb();
      const newGal = {
        id: 'g_' + Math.random().toString(36).substr(2, 9),
        title_en,
        title_pa,
        image_url,
        created_at: new Date().toISOString()
      };

      db.gallery.unshift(newGal); // Add to the top
      await writeDb(db);
      res.status(201).json(newGal);
    } catch {
      res.status(500).json({ error: 'Could not add image.' });
    }
  });

  app.delete('/api/admin/gallery/:id', verifyAdminToken, async (req, res) => {
    try {
      const { id } = req.params;
      const db = await readDb();
      db.gallery = db.gallery.filter(g => g.id !== id);
      await writeDb(db);
      res.json({ success: true, message: 'Image deleted from gallery.' });
    } catch {
      res.status(500).json({ error: 'Could not remove photo.' });
    }
  });


  // ==========================================
  // STATIC ASSETS AND FRONTEND ROUTING
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    // In development mode, load Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serving built files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Komal Creations server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite server:", err);
});

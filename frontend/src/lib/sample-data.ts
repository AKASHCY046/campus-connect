// Seed data for the local-first data layer.
//
// Every service (canteen, library, academic, events, facilities…) tries the
// Spring Boot API first and falls back to localStorage. This module makes sure
// the localStorage side is populated with realistic demo content on first run
// so every screen has something to show.

import { MenuItem } from './localStorage-api';

const now = () => new Date().toISOString();
const daysFromNow = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString();
};

export const sampleMenuItems: MenuItem[] = [
  { id: 'menu_001', name: 'Chicken Biryani', price: 120, available: true, category: 'lunch', prepTime: 20, calories: 650, veg: false, popular: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_002', name: 'Paneer Butter Masala', price: 100, available: true, category: 'lunch', prepTime: 15, calories: 580, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_003', name: 'Masala Dosa', price: 60, available: true, category: 'breakfast', prepTime: 10, calories: 450, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_004', name: 'Samosa (2 pcs)', price: 30, available: true, category: 'snacks', prepTime: 5, calories: 280, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_005', name: 'Cold Coffee', price: 50, available: true, category: 'beverages', prepTime: 5, calories: 180, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_006', name: 'Veg Sandwich', price: 40, available: true, category: 'snacks', prepTime: 8, calories: 320, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_007', name: 'Filter Coffee', price: 25, available: true, category: 'beverages', prepTime: 4, calories: 90, veg: true, popular: true, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_008', name: 'Veg Fried Rice', price: 80, available: true, category: 'dinner', prepTime: 12, calories: 520, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop', createdAt: now() },
  { id: 'menu_009', name: 'Chocolate Brownie', price: 70, available: false, category: 'snacks', prepTime: 3, calories: 410, veg: true, popular: false, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=300&fit=crop', createdAt: now() },
];

const sampleAssignments = [
  { id: 'asg_001', title: 'Data Structures — Assignment 3', description: 'Implement and analyse an AVL tree with insert, delete and balance operations. Submit source code and a short complexity report.', due_date: daysFromNow(5), max_marks: 20, created_by: 'u_faculty', subject: 'Data Structures', file_url: '', created_at: now(), submissions: [] },
  { id: 'asg_002', title: 'Operating Systems — Scheduling Simulation', description: 'Build a simulator comparing FCFS, SJF and Round Robin scheduling. Include average wait-time charts.', due_date: daysFromNow(12), max_marks: 25, created_by: 'u_faculty', subject: 'Operating Systems', file_url: '', created_at: now(), submissions: [] },
  { id: 'asg_003', title: 'DBMS — ER Modelling', description: 'Design a normalised schema (up to 3NF) for a campus library system and write 8 representative SQL queries.', due_date: daysFromNow(-2), max_marks: 15, created_by: 'u_faculty', subject: 'DBMS', file_url: '', created_at: now(), submissions: [{ id: 'sub_1', assignment_id: 'asg_003', student_id: 'u_student', status: 'graded', grade: '13/15' }] },
];

const sampleMaterials = [
  { id: 'mat_001', title: 'Algorithms — Lecture Notes (Weeks 1–6)', category: 'notes', description: 'Consolidated notes covering asymptotic analysis, divide & conquer, greedy and dynamic programming.', uploaded_by: 'u_faculty', uploaded_by_name: 'Dr. Sarah Smith', subject: 'Algorithms', downloads: 128, file_url: '', requires_code: false, created_at: now(), updated_at: now() },
  { id: 'mat_002', title: 'Operating Systems — Previous Year Papers', category: 'papers', description: 'Question papers from the last four semesters with marking schemes.', uploaded_by: 'u_faculty', uploaded_by_name: 'Dr. Sarah Smith', subject: 'Operating Systems', downloads: 96, file_url: '', requires_code: false, created_at: now(), updated_at: now() },
  { id: 'mat_003', title: 'DBMS — Reference Textbook (Chapters 1–5)', category: 'reference', description: 'Recommended reading for relational model, algebra and normalisation.', uploaded_by: 'u_faculty', uploaded_by_name: 'Dr. Sarah Smith', subject: 'DBMS', downloads: 54, file_url: '', requires_code: false, created_at: now(), updated_at: now() },
];

const sampleGroups = [
  { id: 'grp_001', name: 'Competitive Programming Circle', subject: 'Algorithms', description: 'Weekly problem-solving sessions and contest practice on Codeforces and LeetCode.', capacity: 25, member_count: 12, created_by: 'u_student', created_at: now() },
  { id: 'grp_002', name: 'DBMS Project Team', subject: 'DBMS', description: 'Building a campus events database as the semester project. Looking for two more members.', capacity: 6, member_count: 4, created_by: 'u_student', created_at: now() },
  { id: 'grp_003', name: 'GATE 2027 Study Group', subject: 'General', description: 'Structured preparation covering the full GATE CS syllabus with mock tests every fortnight.', capacity: 40, member_count: 21, created_by: 'u_student', created_at: now() },
];

const sampleForums = [
  { id: 'frm_001', topic: 'Best resources for learning dynamic programming?', description: 'Share tutorials, playlists and problem sets that helped you get comfortable with DP.', subject: 'Algorithms', author_id: 'u_student', author_name: 'Alex Johnson', created_at: now(), updated_at: now(), posts: { count: 7 } },
  { id: 'frm_002', topic: 'Deadlock handling: prevention vs avoidance', description: 'Discussion thread for the OS module — when is each strategy actually practical?', subject: 'Operating Systems', author_id: 'u_faculty', author_name: 'Dr. Sarah Smith', created_at: now(), updated_at: now(), posts: { count: 4 } },
];

function seed<T>(key: string, value: T[]) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/** Initialise localStorage with demo content the first time the app runs. */
export const initializeSampleData = () => {
  try {
    seed('canteen_menu_items', sampleMenuItems);
    seed('canteen_orders', []);
    seed('assignments', sampleAssignments);
    seed('study_materials', sampleMaterials);
    seed('study_groups', sampleGroups);
    seed('forums', sampleForums);
  } catch (err) {
    console.warn('Sample data initialisation skipped:', err);
  }
};

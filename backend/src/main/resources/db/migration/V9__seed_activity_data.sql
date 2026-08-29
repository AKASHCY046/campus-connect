-- Additional demo content so the API-backed experience matches the offline one.

INSERT INTO study_materials (id, title, description, file_url, category, subject, created_at, updated_at, created_by, updated_by) VALUES
('mat_001', 'Algorithms — Lecture Notes (Weeks 1-6)', 'Consolidated notes on asymptotic analysis, divide & conquer, greedy and DP.', '', 'NOTES', 'Algorithms', NOW(), NOW(), 'u_faculty', 'u_faculty'),
('mat_002', 'Operating Systems — Previous Year Papers', 'Question papers from the last four semesters with marking schemes.', '', 'QUESTION_PAPERS', 'Operating Systems', NOW(), NOW(), 'u_faculty', 'u_faculty'),
('mat_003', 'DBMS — Reference Reading (Chapters 1-5)', 'Recommended reading for the relational model, algebra and normalisation.', '', 'REFERENCE', 'DBMS', NOW(), NOW(), 'u_faculty', 'u_faculty');

INSERT INTO assignments (id, title, description, file_url, due_date, points, course, created_at, updated_at, created_by, updated_by) VALUES
('asg_001', 'Data Structures — Assignment 3', 'Implement and analyse an AVL tree with insert, delete and balance operations.', NULL, DATE_ADD(NOW(), INTERVAL 5 DAY), 20, 'Data Structures', NOW(), NOW(), 'u_faculty', 'u_faculty'),
('asg_002', 'Operating Systems — Scheduling Simulation', 'Build a simulator comparing FCFS, SJF and Round Robin scheduling.', NULL, DATE_ADD(NOW(), INTERVAL 12 DAY), 25, 'Operating Systems', NOW(), NOW(), 'u_faculty', 'u_faculty');

INSERT INTO campus_events (id, title, description, type, event_date, location, capacity, registered_count, image_url, created_at, updated_at, created_by, updated_by) VALUES
('evt_techfest', 'TechFest 2026', 'Annual technology festival with hackathons, robotics and industry keynotes.', 'CULTURAL', DATE_ADD(NOW(), INTERVAL 9 DAY), 'Main Auditorium', 600, 512, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop', NOW(), NOW(), 'u_admin', 'u_admin'),
('evt_career', 'Campus Placement Drive', 'Meet 40+ recruiting companies across software, core engineering and analytics roles.', 'WORKSHOP', DATE_ADD(NOW(), INTERVAL 14 DAY), 'Training & Placement Block', 400, 289, 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop', NOW(), NOW(), 'u_admin', 'u_admin'),
('evt_cultural', 'Cultural Night - Rhythms', 'An evening of music, dance and drama performances by student clubs.', 'CULTURAL', DATE_ADD(NOW(), INTERVAL 21 DAY), 'Open Air Theatre', 800, 740, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop', NOW(), NOW(), 'u_admin', 'u_admin'),
('evt_sports', 'Inter-Department Sports Meet', 'Track & field, cricket, football and basketball tournaments across departments.', 'SPORTS', DATE_ADD(NOW(), INTERVAL 4 DAY), 'Central Sports Ground', 500, 430, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop', NOW(), NOW(), 'u_admin', 'u_admin'),
('evt_seminar', 'Research Seminar: Applied AI', 'Faculty and research scholars present recent work on applied machine learning.', 'ACADEMIC', DATE_ADD(NOW(), INTERVAL 2 DAY), 'Seminar Hall 2', 120, 96, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop', NOW(), NOW(), 'u_faculty', 'u_faculty');

INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at, updated_at, created_by, updated_by) VALUES
('ntf_welcome_student', 'u_student', 'Welcome to Campus Connect', 'Explore the library, canteen, academic hub and campus services from your dashboard.', 'success', 0, NOW(), NOW(), 'system', 'system'),
('ntf_tip_student', 'u_student', 'Tip: Pre-order your lunch', 'Beat the queue - order ahead in the Canteen and pick up with your token number.', 'info', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW(), 'system', 'system');

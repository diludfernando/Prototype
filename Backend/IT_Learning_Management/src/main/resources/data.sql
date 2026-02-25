-- Initial Data for IT Learning Management

-- Courses
INSERT INTO courses (title, provider, category, difficulty_level, price, skills_covered, rating, url) VALUES
('Python for Data Science', 'Coursera', 'Data Science', 'Beginner', 0.00, 'Python, Data Analysis, NumPy, Pandas', 4.8, 'https://www.coursera.org/learn/python-for-data-science'),
('Advanced Java Programming', 'Udemy', 'Programming', 'Advanced', 49.99, 'Java, Spring Boot, Microservices, Hibernate', 4.7, 'https://www.udemy.com/course/advanced-java/'),
('Cybersecurity Fundamentals', 'edX', 'Cybersecurity', 'Beginner', 0.00, 'Network Security, Ethical Hacking, Cryptography', 4.6, 'https://www.edx.org/course/cybersecurity-fundamentals'),
('AWS Cloud Architecture', 'Cloud Academy', 'Cloud Computing', 'Intermediate', 29.99, 'AWS, Cloud Solutions, Serverless, S3', 4.5, 'https://cloudacademy.com/course/aws-cloud-architecture/');


-- Student Eligibility (Sample studentId = 1)
INSERT INTO student_eligibility (student_id, free_trial_used, free_sessions, hard_level_passed) VALUES
(1, 0, 5, 0);

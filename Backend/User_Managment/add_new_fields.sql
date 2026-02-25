ALTER TABLE student_profiles 
ADD COLUMN skills VARCHAR(1000) NULL AFTER career_goals,
ADD COLUMN gpa DOUBLE NULL AFTER about;

package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSyncRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSyncRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> RUNNING DATABASE SYNC SCRIPT <<<");
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS Counselling_Management_db.counsellors;");
            
            String createViewSql = 
                "CREATE OR REPLACE VIEW Counselling_Management_db.counsellors AS " +
                "SELECT " +
                "    u.id AS id, " +
                "    cp.full_name AS name, " +
                "    u.email AS email, " +
                "    cp.specialization AS specialization, " +
                "    cp.years_of_experience AS experience_years, " +
                "    cp.profile_image_url AS profile_image_url " +
                "FROM User_Management_db.users u " +
                "JOIN User_Management_db.counselor_profiles cp ON u.id = cp.user_id " +
                "WHERE u.role = 'COUNSELOR';";
                
            jdbcTemplate.execute(createViewSql);

            String createHardTestView = 
                "CREATE OR REPLACE VIEW Counselling_Management_db.user_hard_test_status AS " +
                "SELECT u.id AS student_id, up.cleared_hardest_level " +
                "FROM User_Management_db.users u " +
                "JOIN Skill_Managment_db.students s ON u.email = s.username " +
                "JOIN Skill_Managment_db.user_progress up ON s.id = up.student_id;";
            jdbcTemplate.execute(createHardTestView);

            String createCourseCountView = 
                "CREATE OR REPLACE VIEW Counselling_Management_db.user_course_count AS " +
                "SELECT user_id AS student_id, COUNT(*) AS completed_courses " +
                "FROM IT_Learning_Management_db.course_enrollments " +
                "WHERE completed = 1 " +
                "GROUP BY user_id;";
            jdbcTemplate.execute(createCourseCountView);
            
            // Fix column types for profile images (in case Hibernate created them as VARCHAR)
            try {
                jdbcTemplate.execute("ALTER TABLE Counselling_Management_db.counselling_sessions MODIFY counsellor_profile_image LONGTEXT;");
            } catch (Exception e) {
                System.out.println("Column type already updated or table empty.");
            }

            // Backfill profile images for existing sessions
            String backfillSql = 
                "UPDATE Counselling_Management_db.counselling_sessions cs " +
                "JOIN Counselling_Management_db.counsellors c ON cs.counsellor_id = c.id " +
                "SET cs.counsellor_profile_image = c.profile_image_url " +
                "WHERE cs.counsellor_profile_image IS NULL OR cs.counsellor_profile_image = '';";
            jdbcTemplate.execute(backfillSql);

            System.out.println(">>> DATABASE VIEWS AND BACKFILL COMPLETED SUCCESSFULLY <<<");
        } catch (Exception e) {
            System.err.println(">>> FAILED TO CREATE VIEW: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

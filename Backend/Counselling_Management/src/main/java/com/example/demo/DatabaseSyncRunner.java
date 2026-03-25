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
                "    cp.years_of_experience AS experience_years " +
                "FROM User_Management_db.users u " +
                "JOIN User_Management_db.counselor_profiles cp ON u.id = cp.user_id " +
                "WHERE u.role = 'COUNSELOR';";
                
            jdbcTemplate.execute(createViewSql);
            System.out.println(">>> DATABASE VIEW CREATED SUCCESSFULLY <<<");
        } catch (Exception e) {
            System.err.println(">>> FAILED TO CREATE VIEW: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

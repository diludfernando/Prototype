# Database Schema Documentation
## Skill Bridge Lanka - User Management System

---

## Table of Contents
1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Table Definitions](#table-definitions)
5. [Design Justifications](#design-justifications)
6. [Normalization Analysis](#normalization-analysis)
7. [Indexing Strategy](#indexing-strategy)
8. [Sample Data](#sample-data)

---

## Overview

The Skill Bridge Lanka database is designed to support a career counseling platform that connects students with counselors. The system manages three distinct user types (Students, Counselors, and Admins) with role-based access control and profile management.

### System Requirements Addressed:
- ✅ User authentication and authorization
- ✅ Role-based access control (RBAC)
- ✅ Separate profile management for students and counselors
- ✅ Profile completion tracking for students
- ✅ Admin user management capabilities
- ✅ Data integrity and validation
- ✅ Performance optimization through indexing

---

## Design Principles

### 1. **Separation of Concerns**
- **Authentication data** (users table) is separated from **profile data** (profile tables)
- Rationale: Login credentials and roles rarely change, while profile information is frequently updated
- Benefit: Smaller table for authentication queries = faster login performance

### 2. **Normalization (3NF)**
- No redundant data across tables
- Each table represents a single entity type
- Proper foreign key relationships eliminate data duplication

### 3. **Data Integrity**
- UNIQUE constraints prevent duplicate accounts
- NOT NULL constraints ensure required fields are present
- Foreign key constraints maintain referential integrity
- Validation constraints prevent invalid data entry

### 4. **Performance Optimization**
- Strategic indexes on frequently queried columns
- Lazy loading for profile relationships to avoid unnecessary joins
- Composite indexes for multi-column queries

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ role            │
│ enabled         │
│ created_at      │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
    (1:0..1)       (1:0..1)            │
         │              │              │
         ▼              ▼              │
┌──────────────┐  ┌──────────────┐    │
│student_      │  │counselor_    │    │
│profiles      │  │profiles      │    │
├──────────────┤  ├──────────────┤    │
│ id (PK)      │  │ id (PK)      │    │
│ user_id (FK) │  │ user_id (FK) │    │
│ full_name    │  │ full_name    │    │
│ phone        │  │ phone_number │    │
│ university   │  │ qualification│    │
│ ...          │  │ ...          │    │
└──────────────┘  └──────────────┘    │
                                       │
                                 (ADMIN users
                                  have no profile)
```

**Relationship Type:** One-to-One (Optional)
- One User can have zero or one StudentProfile
- One User can have zero or one CounselorProfile
- Admin users have no profile (authentication only)

---

## Table Definitions

### 1. users (Primary Authentication Table)

**Purpose:** Stores authentication credentials and role information for all system users.

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_role_enabled (role, enabled),
    
    CHECK (role IN ('STUDENT', 'COUNSELOR', 'ADMIN'))
);
```

#### Field Definitions:

| Field | Type | Constraints | Justification |
|-------|------|-------------|---------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Surrogate key for efficient joins; BIGINT supports 9+ quintillion records |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Business key; ensures one account per email; 100 chars accommodates long institutional emails |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt hash output is 60 chars; 255 allows for future algorithm changes |
| `role` | VARCHAR(20) | NOT NULL, CHECK constraint | Enum stored as string for readability; CHECK ensures data integrity |
| `enabled` | BOOLEAN | NOT NULL, DEFAULT TRUE | Allows account deactivation without deletion; preserves audit trail |
| `created_at` | TIMESTAMP | NOT NULL, AUTO | Immutable audit field; tracks account creation |

#### Design Decisions:

**Why separate users from profiles?**
- Login queries don't need profile data (JOIN overhead)
- Profile updates don't touch authentication table (better security)
- Admins don't need profiles (cleaner design)

**Why VARCHAR(20) for role instead of INT?**
- Self-documenting (readable in raw queries)
- No need for lookup table for only 3 values
- Enum in application code provides type safety

**Why 'enabled' instead of 'deleted_at' (soft delete)?**
- Current requirement: simple active/inactive status
- No audit requirement to track deletion timestamp
- Can be enhanced later if needed

---

### 2. student_profiles (Extended Student Information)

**Purpose:** Stores detailed profile information specific to students for career counseling and matching.

```sql
CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) CHECK (phone REGEXP '^\\+?[0-9]{10,15}$'),
    university VARCHAR(150),
    degree_program VARCHAR(100),
    year_level INT CHECK (year_level BETWEEN 1 AND 7),
    selected_career_path VARCHAR(100),
    career_goals VARCHAR(500),
    skills VARCHAR(1000),
    interests VARCHAR(500),
    about VARCHAR(1000),
    gpa DECIMAL(3,2) CHECK (gpa BETWEEN 0.0 AND 4.0),
    linkedin_url VARCHAR(200) CHECK (linkedin_url REGEXP '^(https?://)?([[a-zA-Z0-9-]+\\.)*linkedin\\.com/.*$'),
    github_url VARCHAR(200) CHECK (github_url REGEXP '^(https?://)?([[a-zA-Z0-9-]+\\.)*github\\.com/.*$'),
    profile_image_url VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

#### Field Definitions:

| Field | Type | Constraints | Justification |
|-------|------|-------------|---------------|
| `user_id` | BIGINT | FK, NOT NULL, UNIQUE | Enforces 1:1 relationship; UNIQUE prevents duplicate profiles |
| `full_name` | VARCHAR(100) | NOT NULL | Required for identification; 100 chars accommodates international names |
| `phone` | VARCHAR(20) | OPTIONAL, Pattern validated | International format (+94771234567); VARCHAR for leading zeros/+ |
| `university` | VARCHAR(150) | OPTIONAL | Allows long institutional names; nullable for incomplete profiles |
| `degree_program` | VARCHAR(100) | OPTIONAL | Free text for flexibility; nullable for incomplete profiles |
| `year_level` | INT | OPTIONAL, Range: 1-7 | Supports undergrad (1-4) + grad (5-7); NULL for non-enrolled |
| `selected_career_path` | VARCHAR(100) | OPTIONAL | Free text for flexibility; may convert to FK later with career_paths table |
| `career_goals` | VARCHAR(500) | OPTIONAL | Medium text for sentences; used in counselor matching |
| `skills` | VARCHAR(1000) | OPTIONAL | Comma-separated or paragraph; may normalize to separate table later |
| `interests` | VARCHAR(500) | OPTIONAL | For counselor matching and career recommendations |
| `about` | VARCHAR(1000) | OPTIONAL | Personal statement for profile completeness |
| `gpa` | DECIMAL(3,2) | OPTIONAL, Range: 0.0-4.0 | Standard US GPA scale; DECIMAL avoids floating-point errors |
| `linkedin_url` | VARCHAR(200) | OPTIONAL, URL validated | Professional networking; pattern ensures valid LinkedIn URLs |
| `github_url` | VARCHAR(200) | OPTIONAL, URL validated | Tech portfolio; pattern ensures valid GitHub URLs |
| `profile_image_url` | VARCHAR(300) | OPTIONAL | External storage URL (AWS S3, Cloudinary, etc.) |
| `created_at` | TIMESTAMP | NOT NULL, AUTO | Audit: when profile was created |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO-UPDATE | Audit: last modification timestamp |

#### Design Decisions:

**Why nullable fields (university, degree_program, year_level)?**
- Profiles can be incomplete during registration
- Profile completion percentage is a feature (encourages updates)
- Not all students may be currently enrolled

**Why text fields instead of separate tables for skills/interests?**
- Current requirement: display and basic matching
- No complex search/filter requirements yet
- Can normalize later if needed (premature optimization avoided)
- Simpler schema for current scale

**Why CASCADE delete?**
- Business rule: User deletion should remove all personal data
- GDPR compliance (right to be forgotten)
- Orphaned profiles have no value without user account

**Why VARCHAR for GPA instead of separate table?**
- Not all countries use GPA (might be percentage, class rank, etc.)
- Simple storage for current needs
- Range validation prevents invalid values

---

### 3. counselor_profiles (Counselor Professional Information)

**Purpose:** Stores professional credentials and information for career counselors to build trust with students.

```sql
CREATE TABLE counselor_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL CHECK (phone_number REGEXP '^\\+?[0-9]{10,15}$'),
    qualification VARCHAR(200) NOT NULL,
    specialization VARCHAR(200) NOT NULL,
    years_of_experience INT NOT NULL CHECK (years_of_experience BETWEEN 0 AND 50),
    short_bio VARCHAR(1000) NOT NULL,
    linkedin_url VARCHAR(200) CHECK (linkedin_url REGEXP '^(https?://)?([[a-zA-Z0-9-]+\\.)*linkedin\\.com/.*$'),
    profile_image_url VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

#### Field Definitions:

| Field | Type | Constraints | Justification |
|-------|------|-------------|---------------|
| `user_id` | BIGINT | FK, NOT NULL, UNIQUE | Enforces 1:1 relationship with users |
| `full_name` | VARCHAR(100) | NOT NULL | Required for student trust; professional display |
| `phone_number` | VARCHAR(20) | NOT NULL, Pattern validated | Required for student contact; business need |
| `qualification` | VARCHAR(200) | NOT NULL | Credentials build trust (e.g., "PhD in Career Counseling") |
| `specialization` | VARCHAR(200) | NOT NULL | Area of expertise (e.g., "IT & Software Engineering") |
| `years_of_experience` | INT | NOT NULL, Range: 0-50 | Track expertise level; 50 years max is reasonable |
| `short_bio` | VARCHAR(1000) | NOT NULL | Professional summary for student matching |
| `linkedin_url` | VARCHAR(200) | OPTIONAL, URL validated | Professional verification; builds credibility |
| `profile_image_url` | VARCHAR(300) | OPTIONAL | Professional photo increases trust |
| `created_at` | TIMESTAMP | NOT NULL, AUTO | Audit trail |
| `updated_at` | TIMESTAMP | NOT NULL, AUTO-UPDATE | Track profile modifications |

#### Design Decisions:

**Why separate table from student_profiles?**
- Different required fields (qualification vs university)
- Different validation rules (years_of_experience vs year_level)
- Different business logic (counselors created by admin, students self-register)
- Clearer code (no role-based NULL field logic)

**Why all fields required (NOT NULL)?**
- Admin creates counselor accounts manually
- Complete information required before activation
- Builds trust with students (no incomplete profiles)

**Why no 'github_url'?**
- Not relevant for career counselors
- LinkedIn is standard for professionals
- Reduces unnecessary fields

---

## Design Justifications

### Why Three Tables Instead of One or Two?

#### ❌ Option 1: Single User Table (Not Chosen)
```sql
-- All fields in one table
CREATE TABLE users (
    id, email, password, role,
    -- Student fields (NULL for counselors/admins)
    university, degree_program, year_level, gpa,
    -- Counselor fields (NULL for students/admins)  
    qualification, years_of_experience,
    -- Shared fields
    full_name, phone, ...
);
```

**Rejected Because:**
- ❌ Many NULL values (poor space utilization)
- ❌ Complex validation logic (role-based required fields)
- ❌ Large row size (slower queries)
- ❌ Violates single-responsibility principle
- ❌ Poor normalization (2NF violation)

#### ❌ Option 2: Two Tables (users + generic profiles) (Not Chosen)
```sql
CREATE TABLE users (...);
CREATE TABLE profiles (
    user_id, full_name, phone,
    profile_type, -- 'STUDENT' or 'COUNSELOR'
    field1, field2, field3 -- generic fields
);
```

**Rejected Because:**
- ❌ Generic fields are ambiguous
- ❌ No type-specific validation
- ❌ Requires application-level logic for field meaning
- ❌ Poor developer experience (unclear schema)

#### ✅ Option 3: Three Tables (users, student_profiles, counselor_profiles) (Chosen)

**Selected Because:**
- ✅ Clear separation of concerns
- ✅ Type-specific fields and validation
- ✅ No NULL fields for role-specific data
- ✅ Efficient queries (no unnecessary columns)
- ✅ Easy to extend (add new user types)
- ✅ Self-documenting schema
- ✅ Follows SOLID principles

---

### Why One-to-One Relationships?

**Business Rules:**
- One user account can have only one profile
- One profile belongs to only one user account
- Admins have no profiles (authentication only)

**Implementation:**
```java
@OneToOne
@JoinColumn(name = "user_id", nullable = false, unique = true)
private User user;
```

**Key Constraints:**
1. **UNIQUE on user_id**: Prevents duplicate profiles
2. **NOT NULL on user_id**: Every profile must belong to a user
3. **Foreign Key**: Referential integrity (no orphaned profiles)
4. **Cascade DELETE**: Profile deleted when user is deleted

---

### Why Cascade Delete?

**Rationale:**
- Profile data is meaningless without the associated user account
- Simplifies data management (no orphaned records)
- GDPR compliance (right to erasure)
- Prevents data inconsistency

**Alternative Considered:**
- Soft delete with 'deleted_at' timestamp
- Rejected for MVP: adds complexity without current business need
- Can be added later if audit requirements emerge

---

## Normalization Analysis

### First Normal Form (1NF) ✅
- ✅ All fields contain atomic values
- ✅ No repeating groups
- ✅ Each cell contains a single value

### Second Normal Form (2NF) ✅
- ✅ All non-key attributes depend on entire primary key
- ✅ No partial dependencies (single-column PKs)

### Third Normal Form (3NF) ✅
- ✅ No transitive dependencies
- ✅ All non-key attributes depend only on primary key
- ✅ Example: email stored only in users (not duplicated in profiles)

### Denormalization Decisions:

**Skills as text field instead of separate table:**
- Trade-off: Query performance vs. normalization
- Current requirement: Simple display, no complex filtering
- Decision: Keep denormalized until search requirements emerge
- Benefit: Simpler queries, faster development

---

## Indexing Strategy

### Primary Keys (Auto-indexed)
- `users.id`
- `student_profiles.id`
- `counselor_profiles.id`

### Unique Constraints (Auto-indexed)
- `users.email` - Fast login lookups
- `student_profiles.user_id` - Enforce 1:1 relationship
- `counselor_profiles.user_id` - Enforce 1:1 relationship

### Explicit Indexes

#### 1. `idx_email` ON users(email)
**Query Pattern:**
```sql
SELECT * FROM users WHERE email = ?
```
**Frequency:** Every login request
**Impact:** Critical for performance
**Cardinality:** High (unique values)

#### 2. `idx_role` ON users(role)
**Query Pattern:**
```sql
SELECT * FROM users WHERE role = 'STUDENT'
```
**Frequency:** Admin dashboard, user listings
**Impact:** Significant for admin operations
**Cardinality:** Low (3 distinct values)

#### 3. `idx_role_enabled` ON users(role, enabled)
**Query Pattern:**
```sql
SELECT * FROM users WHERE role = 'STUDENT' AND enabled = TRUE
```
**Frequency:** Admin dashboard filtering
**Impact:** High for admin performance
**Cardinality:** Medium (6 combinations)
**Type:** Composite index

**Why Composite Index?**
- Common query pattern in admin dashboard
- Filters by role AND status simultaneously
- Single index covers both conditions efficiently
- Order: role first (higher selectivity)

### Index Justification:

**Why not index full_name?**
- Low query frequency (not in WHERE clauses)
- Used primarily for display (SELECT clause)
- Would slow down INSERT/UPDATE operations

**Why not index created_at?**
- Rarely used for filtering
- Mostly used for sorting (doesn't benefit from index as much)
- Can add later if temporal queries become frequent

**Why not index foreign keys beyond user_id?**
- user_id already indexed (UNIQUE constraint)
- No other foreign keys in current schema

---

## Sample Data

### Admin User (Seeded on Startup)
```sql
INSERT INTO users (email, password_hash, role, enabled) 
VALUES (
    'admin@skillbridge.lk',
    '$2a$10$...',  -- BCrypt hash of 'Admin@123'
    'ADMIN',
    TRUE
);
```

### Sample Student
```sql
-- User account
INSERT INTO users (email, password_hash, role, enabled) 
VALUES ('john.doe@university.lk', '$2a$10$...', 'STUDENT', TRUE);

-- Student profile
INSERT INTO student_profiles (
    user_id, full_name, phone, university, degree_program, 
    year_level, gpa, career_goals, skills, interests
) VALUES (
    2,  -- Assuming user_id = 2
    'John Doe',
    '+94771234567',
    'University of Colombo',
    'Computer Science',
    3,
    3.75,
    'Become a Full Stack Developer specializing in cloud technologies',
    'Java, Spring Boot, React, Docker, AWS',
    'Web Development, Cloud Computing, AI/ML'
);
```

### Sample Counselor
```sql
-- User account
INSERT INTO users (email, password_hash, role, enabled) 
VALUES ('jane.smith@skillbridge.lk', '$2a$10$...', 'COUNSELOR', TRUE);

-- Counselor profile
INSERT INTO counselor_profiles (
    user_id, full_name, phone_number, qualification, specialization,
    years_of_experience, short_bio, linkedin_url
) VALUES (
    3,  -- Assuming user_id = 3
    'Dr. Jane Smith',
    '+94771234568',
    'PhD in Career Counseling, MSc in Psychology',
    'IT & Software Engineering Career Guidance',
    15,
    'Experienced career counselor specializing in technology sector guidance. Helped 500+ students transition into successful tech careers.',
    'https://linkedin.com/in/drjanesmith'
);
```

---

## Validation Rules Summary

| Field | Rule | Rationale |
|-------|------|-----------|
| Phone | `^\\+?[0-9]{10,15}$` | International format; 10-15 digits |
| Year Level | 1-7 | Undergrad (1-4) + Postgrad (5-7) |
| GPA | 0.0-4.0 | Standard US scale; DECIMAL prevents precision errors |
| Years Experience | 0-50 | Reasonable professional career span |
| LinkedIn URL | `linkedin.com/*` | Ensures valid LinkedIn profiles |
| GitHub URL | `github.com/*` | Ensures valid GitHub profiles |

---

## Database Configuration

### application.properties
```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/skillbridge_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.time_zone=UTC

# Connection Pool (HikariCP)
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
```

### DDL Auto Modes:
- **Development:** `update` (auto-create/modify schema)
- **Production:** `validate` (error if schema doesn't match entities)

---

## Migration Strategy

### For Existing Databases:
```sql
-- Add new fields (if migrating from older schema)
ALTER TABLE student_profiles 
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE counselor_profiles 
    ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_role_enabled ON users(role, enabled);

-- Verify structure
SHOW CREATE TABLE users;
SHOW CREATE TABLE student_profiles;
SHOW CREATE TABLE counselor_profiles;
```

---

## Alignment with System Requirements

| Requirement | Implementation | Table(s) |
|-------------|----------------|----------|
| User authentication | email + password_hash + BCrypt | users |
| Role-based access | role field with CHECK constraint | users |
| Student self-registration | Public endpoint + auto-profile creation | users, student_profiles |
| Admin-managed counselors | Admin-only endpoint | users, counselor_profiles |
| Profile completion tracking | 10-field calculation in service layer | student_profiles |
| Account enable/disable | enabled boolean flag | users |
| Data integrity | Foreign keys + UNIQUE + NOT NULL | All tables |
| Query performance | Strategic indexes | users (3 indexes) |
| Audit trail | created_at, updated_at timestamps | All tables |

---

## Future Enhancements (Not Implemented)

### Potential Additions:
1. **Soft Delete:** Add `deleted_at` for audit trail
2. **Security:** Add `email_verified`, `last_login`, `failed_login_attempts`
3. **Skills Normalization:** Create `skills` and `student_skills` tables
4. **Career Paths:** Create `career_paths` reference table
5. **Sessions Table:** Track counseling sessions
6. **Appointments Table:** Schedule student-counselor meetings
7. **Feedback Table:** Student ratings for counselors

### Why Not Implemented Now?
- ✅ YAGNI Principle (You Aren't Gonna Need It)
- ✅ Avoid premature optimization
- ✅ Wait for actual requirements to emerge
- ✅ Simpler code is easier to maintain

---

## Conclusion

This database design achieves:
- ✅ **Well-structured:** Clear separation of authentication and profile data
- ✅ **Normalized:** 3NF compliance with justified denormalizations
- ✅ **Correct relationships:** Proper 1:1 relationships with UNIQUE constraints
- ✅ **Primary keys:** Auto-increment surrogate keys on all tables
- ✅ **UNIQUE constraints:** Email uniqueness enforced
- ✅ **Necessary indexes:** Strategic indexes for common queries
- ✅ **Accurate fields:** Type-appropriate columns with validation
- ✅ **No redundancy:** Each fact stored once
- ✅ **Justified decisions:** Every design choice documented with rationale

The schema supports current requirements while remaining flexible for future enhancements.

---

**Document Version:** 1.0  
**Last Updated:** February 25, 2026  
**Author:** Skill Bridge Lanka Development Team

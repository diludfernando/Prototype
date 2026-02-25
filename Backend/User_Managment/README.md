# Skill Bridge Lanka - User Management Backend

A comprehensive Spring Boot backend for managing user registration and profiles for the Skill Bridge Lanka platform.

## 🚀 Features

- **User Registration & Authentication**
  - Student self-registration
  - JWT-based authentication
  - Role-based access control (STUDENT, COUNSELOR, ADMIN)
  - BCrypt password encryption

- **Profile Management**
  - Comprehensive student profiles
  - Profile completion tracking (%)
  - Update profile fields individually
  - Profile image support

- **Admin Features**
  - View all users
  - Create counselor accounts
  - User management

- **Security**
  - JWT token-based authentication
  - Role-based authorization
  - Secure password hashing
  - Protected endpoints

## 🛠️ Tech Stack

- **Java 17**
- **Spring Boot 3.5.11**
- **Spring Security** with JWT
- **Spring Data JPA** / Hibernate
- **MySQL 8.x**
- **Lombok** for boilerplate reduction
- **MapStruct** for object mapping
- **Jakarta Validation** for input validation
- **Maven** for dependency management

## 📋 Prerequisites

- JDK 17 or higher
- Maven 3.6+
- MySQL 8.x
- MySQL Workbench (optional, for database management)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd User_Management
```

### 2. Configure Database

Create a MySQL database or let the application create it automatically:

```sql
CREATE DATABASE skillbridge_db;
```

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillbridge_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=skillBridgeLankaSecretKeyForJWTTokenGenerationAndValidation2024WithMinimum256BitsForHS256Algorithm
jwt.expiration=86400000
```

### 3. Build the Project

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR file:
```bash
java -jar target/User_Management-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

## 🔐 Default Admin Credentials

```
Email: admin@skillbridge.lk
Password: Admin@123
```

**⚠️ Important:** Change the default password in production!

## 📁 Project Structure

```
src/main/java/com/user_management/
├── config/
│   ├── DataInitializer.java          # Seeds admin user
│   └── SecurityConfig.java           # Security configuration
├── controller/
│   ├── AdminController.java          # Admin endpoints
│   ├── AuthController.java           # Authentication endpoints
│   ├── CounselorController.java      # Counselor endpoints
│   └── StudentController.java        # Student endpoints
├── dto/
│   ├── request/                      # Request DTOs
│   │   ├── CreateCounselorRequest.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   └── StudentProfileUpdateRequest.java
│   └── response/                     # Response DTOs
│       ├── ApiResponse.java
│       ├── LoginResponse.java
│       ├── ProfileCompletionResponse.java
│       ├── StudentProfileResponse.java
│       └── UserResponse.java
├── entity/
│   ├── StudentProfile.java           # Student profile entity
│   └── User.java                     # User entity
├── enums/
│   └── Role.java                     # User roles enum
├── exception/
│   └── GlobalExceptionHandler.java   # Global exception handling
├── repository/
│   ├── StudentProfileRepository.java
│   └── UserRepository.java
├── security/
│   ├── CustomUserDetails.java
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtUtil.java
├── service/
│   ├── AdminService.java
│   ├── AuthService.java
│   ├── ProfileCompletionService.java
│   └── StudentProfileService.java
└── UserManagementApplication.java    # Main application class
```

## 🔌 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login

### Student (Requires STUDENT role)
- `GET /api/student/profile` - Get own profile
- `PUT /api/student/profile` - Update profile (all fields)
- `PATCH /api/student/profile` - Update profile (partial)
- `GET /api/student/profile/completion` - Get completion percentage

### Admin (Requires ADMIN role)
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user by ID
- `POST /api/admin/counselors` - Create counselor account

### Counselor (Requires COUNSELOR role)
- `GET /api/counselor/dashboard` - Access counselor dashboard

## 📖 API Documentation

Detailed API documentation with request/response examples is available in:
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

Database schema documentation is available in:
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## 🧪 Testing with Postman/cURL

### Register a Student
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.lk",
    "password": "password123",
    "fullName": "John Doe",
    "university": "University of Colombo",
    "degreeProgram": "Computer Science",
    "yearLevel": 3
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.lk",
    "password": "password123"
  }'
```

### Get Student Profile (with JWT token)
```bash
curl -X GET http://localhost:8080/api/student/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Profile Completion Calculation

The system calculates profile completion based on 10 fields:
1. Full Name
2. Phone
3. University
4. Degree Program
5. Year Level
6. Career Goals
7. Interests
8. About
9. LinkedIn URL
10. GitHub URL

**Formula:** `(Completed Fields / Total Fields) × 100`

## 🔒 Security Features

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **BCrypt Password Hashing**: Secure password storage
- **Role-Based Access Control**: Endpoint protection based on user roles
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Jakarta Validation for request validation
- **Exception Handling**: Global exception handler for consistent error responses

## 🚦 RBAC Rules

| Endpoint Pattern | Allowed Roles |
|-----------------|---------------|
| `/api/auth/**` | All (Public) |
| `/api/student/**` | STUDENT |
| `/api/admin/**` | ADMIN |
| `/api/counselor/**` | COUNSELOR |

## 📝 Notes

1. **Database Auto-creation**: The application will automatically create tables on first run with `spring.jpa.hibernate.ddl-auto=update`
2. **Admin Seeding**: Admin user is automatically created on application startup
3. **Token Expiry**: JWT tokens expire after 24 hours (configurable)
4. **Profile Ownership**: Students can only access and update their own profiles
5. **Counselor Creation**: Only admins can create counselor accounts

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `application.properties`
- Ensure database exists or `createDatabaseIfNotExist=true` is set

### JWT Token Issues
- Ensure JWT secret is at least 256 bits for HS256 algorithm
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`

### Build Issues
- Run `mvn clean install` to rebuild
- Check Java version: `java -version` (should be 17+)
- Verify Maven version: `mvn -version`

## 📧 Support

For issues and questions, please contact the development team.

## 📄 License

This project is part of Skill Bridge Lanka platform.

---

**Built with ❤️ using Spring Boot**

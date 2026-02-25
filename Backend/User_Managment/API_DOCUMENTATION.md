# Skill Bridge Lanka - User Management API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Register Student
**POST** `/auth/register`

**Description:** Student self-registration with basic profile information.

**Request Body:**
```json
{
  "email": "john.doe@university.lk",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "university": "University of Colombo",
  "degreeProgram": "Computer Science",
  "yearLevel": 3
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": 2,
    "email": "john.doe@university.lk",
    "role": "STUDENT",
    "expiresIn": 86400000,
    "expiryTime": "2026-02-25T10:30:00"
  },
  "timestamp": "2026-02-24T10:30:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already registered",
  "data": null,
  "timestamp": "2026-02-24T10:30:00"
}
```

---

### 1.2 Login
**POST** `/auth/login`

**Description:** Login for all user roles (STUDENT, COUNSELOR, ADMIN).

**Request Body:**
```json
{
  "email": "john.doe@university.lk",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": 2,
    "email": "john.doe@university.lk",
    "role": "STUDENT",
    "expiresIn": 86400000,
    "expiryTime": "2026-02-25T10:30:00"
  },
  "timestamp": "2026-02-24T10:30:00"
}
```

**Admin Login Example:**
```json
{
  "email": "admin@skillbridge.lk",
  "password": "Admin@123"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null,
  "timestamp": "2026-02-24T10:30:00"
}
```

---

## 2. Student APIs

### 2.1 Get My Profile
**GET** `/student/profile`

**Authorization:** Required (STUDENT role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "fullName": "John Doe",
    "phone": "+94771234567",
    "university": "University of Colombo",
    "degreeProgram": "Computer Science",
    "yearLevel": 3,
    "careerGoals": "Become a Full Stack Developer",
    "interests": "Web Development, AI, Cloud Computing",
    "about": "Passionate computer science student with strong problem-solving skills",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "profileImageUrl": "https://example.com/profile.jpg",
    "updatedAt": "2026-02-24T10:30:00",
    "completionPercentage": 100.0
  },
  "timestamp": "2026-02-24T10:30:00"
}
```

---

### 2.2 Update My Profile (PUT/PATCH)
**PUT** `/student/profile` or **PATCH** `/student/profile`

**Authorization:** Required (STUDENT role)

**Description:** Update student profile. All fields are optional for PATCH.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+94771234567",
  "university": "University of Colombo",
  "degreeProgram": "Computer Science",
  "yearLevel": 4,
  "careerGoals": "Become a Full Stack Developer and Tech Lead",
  "interests": "Web Development, AI, Cloud Computing, DevOps",
  "about": "Passionate computer science student with 2 years of internship experience",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe",
  "profileImageUrl": "https://example.com/profile.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "fullName": "John Doe",
    "phone": "+94771234567",
    "university": "University of Colombo",
    "degreeProgram": "Computer Science",
    "yearLevel": 4,
    "careerGoals": "Become a Full Stack Developer and Tech Lead",
    "interests": "Web Development, AI, Cloud Computing, DevOps",
    "about": "Passionate computer science student with 2 years of internship experience",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "profileImageUrl": "https://example.com/profile.jpg",
    "updatedAt": "2026-02-24T11:00:00",
    "completionPercentage": 100.0
  },
  "timestamp": "2026-02-24T11:00:00"
}
```

---

### 2.3 Get Profile Completion Percentage
**GET** `/student/profile/completion`

**Authorization:** Required (STUDENT role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile completion retrieved successfully",
  "data": {
    "completionPercentage": 70.0,
    "totalFields": 10,
    "completedFields": 7
  },
  "timestamp": "2026-02-24T10:30:00"
}
```

**Fields Considered for Completion:**
1. fullName
2. phone
3. university
4. degreeProgram
5. yearLevel
6. careerGoals
7. interests
8. about
9. linkedinUrl
10. githubUrl

---

## 3. Admin APIs

### 3.1 Get All Users
**GET** `/admin/users`

**Authorization:** Required (ADMIN role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "admin@skillbridge.lk",
      "role": "ADMIN",
      "enabled": true,
      "createdAt": "2026-02-20T08:00:00"
    },
    {
      "id": 2,
      "email": "john.doe@university.lk",
      "role": "STUDENT",
      "enabled": true,
      "createdAt": "2026-02-24T10:30:00"
    },
    {
      "id": 3,
      "email": "counselor@skillbridge.lk",
      "role": "COUNSELOR",
      "enabled": true,
      "createdAt": "2026-02-24T09:00:00"
    }
  ],
  "timestamp": "2026-02-24T10:30:00"
}
```

---

### 3.2 Get User By ID
**GET** `/admin/users/{id}`

**Authorization:** Required (ADMIN role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 2,
    "email": "john.doe@university.lk",
    "role": "STUDENT",
    "enabled": true,
    "createdAt": "2026-02-24T10:30:00"
  },
  "timestamp": "2026-02-24T10:30:00"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "User not found with id: 999",
  "data": null,
  "timestamp": "2026-02-24T10:30:00"
}
```

---

### 3.3 Create Counselor
**POST** `/admin/counselors`

**Authorization:** Required (ADMIN role)

**Description:** Admin creates a counselor account with a temporary password.

**Request Body:**
```json
{
  "email": "counselor@skillbridge.lk",
  "fullName": "Jane Smith",
  "tempPassword": "TempPass@123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Counselor created successfully",
  "data": {
    "id": 3,
    "email": "counselor@skillbridge.lk",
    "role": "COUNSELOR",
    "enabled": true,
    "createdAt": "2026-02-24T09:00:00"
  },
  "timestamp": "2026-02-24T09:00:00"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already registered",
  "data": null,
  "timestamp": "2026-02-24T10:30:00"
}
```

---

## 4. Counselor APIs

### 4.1 Get Dashboard
**GET** `/counselor/dashboard`

**Authorization:** Required (COUNSELOR role)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Counselor dashboard accessed",
  "data": "Welcome to Counselor Dashboard",
  "timestamp": "2026-02-24T10:30:00"
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error, business logic error) |
| 401 | Unauthorized (invalid credentials or missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Validation Rules

### Register Request
- email: Valid email format, required
- password: Minimum 6 characters, maximum 50, required
- fullName: Maximum 100 characters, required
- university: Maximum 150 characters, required
- degreeProgram: Maximum 100 characters, required
- yearLevel: Integer between 1-7, required

### Login Request
- email: Valid email format, required
- password: Minimum 6 characters, required

### Student Profile Update Request
- All fields are optional
- phone: Maximum 20 characters
- careerGoals: Maximum 500 characters
- interests: Maximum 500 characters
- about: Maximum 1000 characters
- linkedinUrl: Maximum 200 characters
- githubUrl: Maximum 200 characters
- profileImageUrl: Maximum 300 characters

### Create Counselor Request
- email: Valid email format, required
- fullName: Maximum 100 characters, required
- tempPassword: Minimum 6 characters, maximum 50, required

---

## Default Admin Credentials

```
Email: admin@skillbridge.lk
Password: Admin@123
```

**Important:** Change the default password after first login in production environment.

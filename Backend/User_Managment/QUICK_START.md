# Quick Start Guide - Skill Bridge Lanka

## 🚀 Getting Started in 5 Minutes

### Step 1: Configure Database
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 2: Run the Application
```bash
mvn spring-boot:run
```

### Step 3: Test with Default Admin
**Admin Credentials:**
- Email: `admin@skillbridge.lk`
- Password: `Admin@123`

---

## 📌 Common API Workflows

### Workflow 1: Student Registration & Profile Setup

**1. Register a Student**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@university.lk",
  "password": "password123",
  "fullName": "John Doe",
  "university": "University of Colombo",
  "degreeProgram": "Computer Science",
  "yearLevel": 3
}
```
→ You'll receive a JWT token in the response

**2. Login (if needed)**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@university.lk",
  "password": "password123"
}
```

**3. View Profile**
```http
GET /api/student/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**4. Update Profile**
```http
PATCH /api/student/profile
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "phone": "+94771234567",
  "careerGoals": "Become a Full Stack Developer",
  "interests": "Web Development, AI",
  "linkedinUrl": "https://linkedin.com/in/yourprofile"
}
```

**5. Check Profile Completion**
```http
GET /api/student/profile/completion
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### Workflow 2: Admin Creates Counselor

**1. Admin Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@skillbridge.lk",
  "password": "Admin@123"
}
```

**2. Create Counselor**
```http
POST /api/admin/counselors
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "email": "counselor@skillbridge.lk",
  "fullName": "Jane Smith",
  "tempPassword": "TempPass@123"
}
```

**3. View All Users**
```http
GET /api/admin/users
Authorization: Bearer ADMIN_JWT_TOKEN
```

---

### Workflow 3: Counselor Login

**1. Counselor Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "counselor@skillbridge.lk",
  "password": "TempPass@123"
}
```

**2. Access Dashboard**
```http
GET /api/counselor/dashboard
Authorization: Bearer COUNSELOR_JWT_TOKEN
```

---

## 🔑 Important Endpoints Reference

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | Public | Student registration |
| `/api/auth/login` | POST | Public | Login for all roles |
| `/api/student/profile` | GET | STUDENT | Get own profile |
| `/api/student/profile` | PUT/PATCH | STUDENT | Update profile |
| `/api/student/profile/completion` | GET | STUDENT | Profile completion % |
| `/api/admin/users` | GET | ADMIN | List all users |
| `/api/admin/users/{id}` | GET | ADMIN | Get user by ID |
| `/api/admin/counselors` | POST | ADMIN | Create counselor |
| `/api/counselor/dashboard` | GET | COUNSELOR | Counselor dashboard |

---

## 🔐 Using JWT Tokens

After login, you receive a token. Use it in all protected requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Details:**
- Expires in: 24 hours
- Format: Bearer token
- Stored in response under `data.token`

---

## 🎯 Profile Completion Fields

To achieve 100% profile completion, fill these 10 fields:
1. ✅ Full Name (required at registration)
2. ⬜ Phone
3. ✅ University (required at registration)
4. ✅ Degree Program (required at registration)
5. ✅ Year Level (required at registration)
6. ⬜ Career Goals
7. ⬜ Interests
8. ⬜ About
9. ⬜ LinkedIn URL
10. ⬜ GitHub URL

---

## 📱 Import Postman Collection

Import `Skill_Bridge_Lanka_API.postman_collection.json` into Postman for ready-to-use API requests.

**Steps:**
1. Open Postman
2. Click Import
3. Select the JSON file
4. Update `{{baseUrl}}` variable if needed
5. After login, copy token to `{{token}}` variable

---

## ⚠️ Common Issues & Solutions

### Issue: "Unauthorized" Error
**Solution:** Check if:
- JWT token is included in Authorization header
- Token format is: `Bearer YOUR_TOKEN`
- Token hasn't expired (24 hours)

### Issue: "Email already registered"
**Solution:** Use a different email or login with existing credentials

### Issue: "Forbidden" Error
**Solution:** Verify you're using the correct role token:
- Student endpoints need STUDENT role
- Admin endpoints need ADMIN role
- Counselor endpoints need COUNSELOR role

### Issue: Database Connection Failed
**Solution:** 
- Ensure MySQL is running
- Check credentials in `application.properties`
- Verify database exists or auto-create is enabled

---

## 📊 Example Response Structure

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Description of result",
  "data": { ... },
  "timestamp": "2026-02-24T10:30:00"
}
```

---

## 🎓 Testing Checklist

- [ ] Run application successfully
- [ ] Admin login works
- [ ] Student registration works
- [ ] Student can view profile
- [ ] Student can update profile
- [ ] Profile completion calculates correctly
- [ ] Admin can create counselor
- [ ] Admin can list users
- [ ] Counselor login works
- [ ] JWT authentication working
- [ ] Role-based access control enforced

---

## 📞 Default Test Credentials

### Admin Account (Pre-seeded)
```
Email: admin@skillbridge.lk
Password: Admin@123
```

### Create Test Student (Register via API)
```
Email: student@university.lk
Password: password123
```

### Create Test Counselor (Admin creates via API)
```
Email: counselor@skillbridge.lk
Password: [Admin sets temporary password]
```

---

## 🔄 Development Tips

1. **Hot Reload**: Changes to code require restart (or use Spring DevTools)
2. **Database Reset**: Change `ddl-auto` to `create` in application.properties to reset DB
3. **Logging**: Check console for SQL queries and debug logs
4. **JWT Secret**: Never commit production secrets to version control
5. **Password Security**: Change default admin password immediately

---

## 📚 Additional Resources

- Full API Documentation: `API_DOCUMENTATION.md`
- Database Schema: `DATABASE_SCHEMA.md`
- Setup Instructions: `README.md`
- Postman Collection: `Skill_Bridge_Lanka_API.postman_collection.json`

---

**Happy Coding! 🎉**

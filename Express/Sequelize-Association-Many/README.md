# Student–Course Management (Sequelize Many-to-Many)

Express + Sequelize + MySQL app demonstrating a **Many-to-Many** association
between `Student` and `Course`, connected through a junction table
`studentcourses`, following the same pattern shown in the video walkthrough.

## Associations implemented (`models/index.js`)

```js
// ONE-TO-ONE
Student.hasOne(IdentityCard);
IdentityCard.belongsTo(Student);

// ONE-TO-MANY
Department.hasMany(Student);
Student.belongsTo(Department);

// MANY-TO-MANY
Student.belongsToMany(Course, { through: StudentCourses });
Course.belongsToMany(Student, { through: StudentCourses });
```

The M:N relationship gives Sequelize the auto-generated helper methods used
in the controller: `student.addCourses(courses)` and `student.removeCourse(course)`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your MySQL credentials
   (must match a database that already exists in MySQL Workbench, e.g. `testdb`):
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```
   On first run, Sequelize (`sync({ force: false })`) will create the tables
   `students`, `courses`, `studentcourses`, `departments`, `identitycards`
   if they don't already exist.

## API Endpoints

| Method | Endpoint                          | Description                                   |
|--------|------------------------------------|------------------------------------------------|
| POST   | `/students`                       | Create a student                                |
| GET    | `/students`                       | Get all students (with their courses)           |
| GET    | `/students/:id`                   | Get one student (with their courses)             |
| PUT    | `/students/:id`                   | Update a student                                |
| DELETE | `/students/:id`                   | Delete a student                                |
| POST   | `/courses/addcourses`             | Create a course                                 |
| GET    | `/courses`                        | Get all courses                                 |
| POST   | `/courses/addstudentCourses`      | Enroll a student into one or more courses (M:N) |
| POST   | `/courses/removestudentCourse`    | Remove a course from a student                  |

## Testing the Many-to-Many flow (Postman)

1. **Create a course**
   `POST http://localhost:3000/courses/addcourses`
   ```json
   { "name": "Backend Development" }
   ```
   Repeat for a second course, e.g. `"Frontend Development"`.

2. **Create a student**
   `POST http://localhost:3000/students`
   ```json
   { "name": "student1", "email": "student1@gmail.com", "age": 21 }
   ```

3. **Enroll the student into courses** (this populates the junction table)
   `POST http://localhost:3000/courses/addstudentCourses`
   ```json
   { "studentId": 1, "courseIds": [1, 2] }
   ```
   Response returns the student with a nested `courses` array.

4. **Verify in MySQL Workbench**
   ```sql
   SELECT * FROM testdb.studentcourses;
   ```
   You should see rows like:
   | id | createdAt | updatedAt | StudentId | courseId |
   |----|-----------|-----------|-----------|----------|
   | 1  | ...       | ...       | 1         | 1        |
   | 2  | ...       | ...       | 1         | 2        |

   ```sql
   SELECT * FROM testdb.students;
   SELECT * FROM testdb.courses;
   ```

5. **Fetch student with courses included**
   `GET http://localhost:3000/students/1`

6. **Remove a course from a student**
   `POST http://localhost:3000/courses/removestudentCourse`
   ```json
   { "studentId": 1, "courseId": 2 }
   ```

## Notes on fixes from the original draft

- `models/studentCourses.js` was missing its `sequelize`/`DataTypes` imports
  — this caused a `ReferenceError` on startup. Fixed here.
- Controllers now import `Student`/`Course` from `../models` (the index file
  that wires up associations) instead of directly from the model files, so
  `addCourses`/`removeCourse` helper methods are always available.
- Single entry point (`app.js`) — the earlier duplicate `index.js` was removed
  to avoid confusion about which file actually registers the course routes
  and model associations.
- `addstudentCourses` route is a `POST` (matches the controller logic, which
  writes data) — some screenshots showed it as `GET`, which is inconsistent
  with a write operation.

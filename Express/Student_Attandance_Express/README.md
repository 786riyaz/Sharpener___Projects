# Attendance System

A student attendance management system built with **Express**, **Sequelize (MySQL)**, **EJS**, and **Axios** — recreated from the reference screenshots (date-based search, mark attendance with Present/Absent radios, read-only view once marked, and an attendance % report).

## Features

- Select a date and search:
  - If attendance for that date is **already marked** → shows a read-only list (✅ present / ❌ absent).
  - If **not marked yet** → shows a form with Present/Absent radio buttons per student and a **Mark Attendance** button.
- **Fetch Attendance report** — shows each student's presence as a fraction (e.g. `3/3`) and percentage across all dates recorded so far.
- One-to-Many Sequelize association: `Student.hasMany(Attendance)`.
- Upsert-based marking, so re-marking the same date safely updates existing records.

## Tech Stack

- Node.js + Express
- Sequelize ORM + MySQL (via `mysql2`)
- EJS (single page shell) + vanilla JS + Axios (AJAX calls, no page reloads)

## Project Structure

```
attendance-system/
├── config/
│   └── db.js               # Sequelize connection
├── controllers/
│   └── attendanceController.js
├── models/
│   ├── Student.js
│   ├── Attendance.js
│   └── index.js             # associations
├── routes/
│   └── attendanceRoutes.js
├── seeders/
│   └── seedStudents.js       # seeds the 11 students from the screenshots
├── views/
│   └── index.ejs
├── public/
│   ├── css/style.css
│   └── js/app.js
├── server.js
├── package.json
└── .env.example
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a MySQL database**
   ```sql
   CREATE DATABASE attendance_db;
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```bash
   cp .env.example .env
   ```
   ```
   DB_NAME=attendance_db
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DIALECT=mysql
   PORT=5000
   ```

4. **Seed the students** (creates the `students` table and inserts the sample names: Siva, Rajesh, Ashok, Sai, Haritha, Ram, Krishna, Anu, Ammu, Adi, venkat)
   ```bash
   npm run seed
   ```

5. **Run the server**
   ```bash
   npm start
   # or, with auto-reload during development:
   npm run dev
   ```

6. Open **http://localhost:5000** in your browser.

## API Endpoints

| Method | Endpoint                        | Description                                                   |
|--------|----------------------------------|-----------------------------------------------------------------|
| GET    | `/api/students`                 | List all students                                               |
| GET    | `/api/attendance?date=YYYY-MM-DD` | Get attendance for a date (marked list or blank form data)    |
| POST   | `/api/attendance`               | Mark attendance — `{ date, records: [{ studentId, status }] }` |
| GET    | `/api/report`                   | Presence fraction & percentage per student across all dates    |

## Notes

- Attendance status is stored as a MySQL `ENUM('present', 'absent')`.
- A unique index on `(student_id, date)` prevents duplicate rows for the same student/day; marking again updates (upserts) the existing record.
- The report's "total sessions" is the count of distinct dates that have ever had attendance recorded.

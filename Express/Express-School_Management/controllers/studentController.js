import pool from "../db.js";

// POST /students
const createStudent = async (req, res) => {
  try {
    const { name, email, age } = req.body;

    if (!name || !email || age === undefined) {
      return res.status(400).json({
        message: "Name, email and age are required",
      });
    }

    const sql = `
            INSERT INTO students (name, email, age)
            VALUES (?, ?, ?)
        `;

    const [result] = await pool.execute(sql, [name, email, age]);

    console.log(`[INSERT] Student created: ID=${result.insertId}, Name=${name}`);

    res.status(201).json({
      message: "Student created successfully",
      student: {
        id: result.insertId,
        name,
        email,
        age,
      },
    });
  } catch (error) {
    console.error("[INSERT ERROR]", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create student",
    });
  }
};

// GET /students
const getStudents = async (req, res) => {
  try {
    const sql = `
            SELECT id, name, email, age
            FROM students
            ORDER BY id
        `;

    const [students] = await pool.execute(sql);

    res.status(200).json(students);
  } catch (error) {
    console.error("[SELECT ERROR]", error.message);

    res.status(500).json({
      message: "Failed to retrieve students",
    });
  }
};

// GET /students/:id
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
            SELECT id, name, email, age
            FROM students
            WHERE id = ?
        `;

    const [students] = await pool.execute(sql, [id]);

    if (students.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json(students[0]);
  } catch (error) {
    console.error("[SELECT BY ID ERROR]", error.message);

    res.status(500).json({
      message: "Failed to retrieve student",
    });
  }
};

// PUT /students/:id
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    if (!name || !email || age === undefined) {
      return res.status(400).json({
        message: "Name, email and age are required",
      });
    }

    const sql = `
            UPDATE students
            SET name = ?, email = ?, age = ?
            WHERE id = ?
        `;

    const [result] = await pool.execute(sql, [name, email, age, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    console.log(`[UPDATE] Student updated: ID=${id}, Name=${name}`);

    res.status(200).json({
      message: "Student updated successfully",
    });
  } catch (error) {
    console.error("[UPDATE ERROR]", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update student",
    });
  }
};

// DELETE /students/:id
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
            DELETE FROM students
            WHERE id = ?
        `;

    const [result] = await pool.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    console.log(`[DELETE] Student deleted: ID=${id}`);

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("[DELETE ERROR]", error.message);

    res.status(500).json({
      message: "Failed to delete student",
    });
  }
};

export { createStudent, getStudents, getStudentById, updateStudent, deleteStudent };

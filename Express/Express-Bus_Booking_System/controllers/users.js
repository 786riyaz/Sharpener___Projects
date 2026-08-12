import db from "../db/database.js";


// POST /users
const createUser = async (req, res) => {
  try {
    const { Name, Email } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({
        message: "Name and Email are required",
      });
    }

    const query = `
      INSERT INTO Users (Name, Email)
      VALUES (?, ?)
    `;

    const [result] = await db.execute(query, [Name, Email]);

    console.log(
      `User inserted successfully. ID: ${result.insertId}, Name: ${Name}, Email: ${Email}`
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
      Name,
      Email,
    });
  } catch (error) {
    console.error("Error inserting user:", error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};


// GET /users
const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM Users
    `;

    const [users] = await db.execute(query);

    console.log("Users retrieved successfully.");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);

    res.status(500).json({
      message: "Failed to retrieve users",
    });
  }
};


export {
  createUser,
  getUsers,
};
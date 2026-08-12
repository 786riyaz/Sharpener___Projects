import db from "../db/database.js";

// INSERT USER
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

    console.log(`User inserted successfully. ID: ${result.insertId}, Name: ${Name}, Email: ${Email}`);

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

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({
        message: "Name and Email are required",
      });
    }

    const query = `
      UPDATE Users
      SET Name = ?, Email = ?
      WHERE Id = ?
    `;

    const [result] = await db.execute(query, [Name, Email, id]);

    if (result.affectedRows === 0) {
      console.log(`Update failed. User with ID ${id} does not exist.`);

      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log(`User updated successfully. ID: ${id}, Name: ${Name}, Email: ${Email}`);

    res.status(200).json({
      message: "User updated successfully",
      userId: id,
      Name,
      Email,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM Users
      WHERE Id = ?
    `;

    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      console.log(`Delete failed. User with ID ${id} does not exist.`);

      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log(`User deleted successfully. ID: ${id}`);

    res.status(200).json({
      message: "User deleted successfully",
      userId: id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};

export { createUser, updateUser, deleteUser };

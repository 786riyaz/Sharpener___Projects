import User from "../models/users.js";

// POST /users
const createUser = async (req, res) => {
  try {
    const { Name, Email } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({
        message: "Name and Email are required",
      });
    }

    const user = await User.create({
      Name,
      Email,
    });

    console.log(`User inserted successfully. ID: ${user.Id}, Name: ${user.Name}, Email: ${user.Email}`);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error inserting user:", error);

    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// GET /users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    console.log("Users retrieved successfully.");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);

    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

export { createUser, getUsers };

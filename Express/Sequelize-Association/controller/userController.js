const { User, Post } = require("../models");

// ==========================================
// CREATE USER
// POST /users
// ==========================================

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const user = await User.create({
      name,
      email,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    res.status(500).json({
      message: "Unable to create user",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE POST FOR A USER
// POST /users/:userId/posts
// ==========================================

const createPost = async (req, res) => {
  try {
    const { userId } = req.params;

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    // Check whether user exists
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Create post and associate it with user
    const post = await Post.create({
      title,
      content,
      UserId: userId,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);

    res.status(500).json({
      message: "Unable to create post",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL USERS
// GET /users
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);

    res.status(500).json({
      message: "Unable to retrieve users",
      error: error.message,
    });
  }
};

// ==========================================
// GET USER WITH POSTS
// GET /users/:userId/posts
// ==========================================

const getUserWithPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Post,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user posts:", error);

    res.status(500).json({
      message: "Unable to retrieve user and posts",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  createPost,
  getUsers,
  getUserWithPosts,
};

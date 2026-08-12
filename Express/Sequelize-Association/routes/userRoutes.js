const express = require("express");

const { createUser, createPost, getUsers, getUserWithPosts } = require("../controller/userController");

const router = express.Router();

// Create User
router.post("/", createUser);

// Get all Users
router.get("/", getUsers);

// Create Post for a User
router.post("/:userId/posts", createPost);

// Get User with all Posts
router.get("/:userId/posts", getUserWithPosts);

module.exports = router;

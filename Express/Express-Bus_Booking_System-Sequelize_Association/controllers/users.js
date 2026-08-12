import User from "../models/users.js";
import Booking from "../models/bookings.js";
import Bus from "../models/buses.js";

const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "name and email are required",
      });
    }

    const user = await User.create({
      Name: name,
      Email: email,
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

// GET /users/:id/bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({
        message: "Invalid user id",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const bookings = await Booking.findAll({
      where: {
        UserId: userId,
      },
      attributes: ["Id", "SeatNumber"],
      include: [
        {
          model: Bus,
          attributes: ["BusNumber"],
        },
      ],
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error retrieving user bookings:", error);

    return res.status(500).json({
      message: "Failed to retrieve user bookings",
      error: error.message,
    });
  }
};

export { createUser, getUsers, getUserBookings };

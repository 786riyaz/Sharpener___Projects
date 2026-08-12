import { Op } from "sequelize";
import Bus from "../models/buses.js";
import Booking from "../models/bookings.js";
import User from "../models/users.js";

const createBus = async (req, res) => {
  try {
    const { busNumber, totalSeats, availableSeats } = req.body;

    if (
      !busNumber ||
      totalSeats === undefined ||
      availableSeats === undefined
    ) {
      return res.status(400).json({
        message: "busNumber, totalSeats and availableSeats are required",
      });
    }

    if (
      !Number.isInteger(Number(totalSeats)) ||
      !Number.isInteger(Number(availableSeats)) ||
      Number(totalSeats) <= 0 ||
      Number(availableSeats) < 0 ||
      Number(availableSeats) > Number(totalSeats)
    ) {
      return res.status(400).json({
        message:
          "totalSeats must be positive and availableSeats must be between 0 and totalSeats",
      });
    }

    const bus = await Bus.create({
      BusNumber: busNumber,
      TotalSeats: Number(totalSeats),
      AvailableSeats: Number(availableSeats),
    });

    return res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Error creating bus:", error);

    return res.status(500).json({
      message: "Failed to create bus",
      error: error.message,
    });
  }
};

// GET /buses/available/:seats
const getAvailableBuses = async (req, res) => {
  try {
    const seats = Number(req.params.seats);

    if (!Number.isFinite(seats)) {
      return res.status(400).json({
        message: "Invalid seats value",
      });
    }

    const buses = await Bus.findAll({
      where: {
        AvailableSeats: {
          [Op.gte]: seats,
        },
      },
    });

    return res.status(200).json(buses);
  } catch (error) {
    console.error("Error retrieving buses:", error);

    return res.status(500).json({
      message: "Failed to retrieve buses",
      error: error.message,
    });
  }
};

// GET /buses/:id/bookings
const getBusBookings = async (req, res) => {
  try {
    const busId = Number(req.params.id);

    if (!Number.isInteger(busId)) {
      return res.status(400).json({
        message: "Invalid bus id",
      });
    }

    const bus = await Bus.findByPk(busId);

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    const bookings = await Booking.findAll({
      where: {
        BusId: busId,
      },
      attributes: ["Id", "SeatNumber"],
      include: [
        {
          model: User,
          attributes: ["Name", "Email"],
        },
      ],
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error retrieving bus bookings:", error);

    return res.status(500).json({
      message: "Failed to retrieve bus bookings",
      error: error.message,
    });
  }
};

export { createBus, getAvailableBuses, getBusBookings };

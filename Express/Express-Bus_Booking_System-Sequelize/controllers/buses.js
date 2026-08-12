import { Op } from "sequelize";
import Bus from "../models/buses.js";

// POST /buses
const createBus = async (req, res) => {
  try {
    const { BusNumber, TotalSeats, AvailableSeats } = req.body;

    if (!BusNumber || TotalSeats === undefined || AvailableSeats === undefined) {
      return res.status(400).json({
        message: "BusNumber, TotalSeats and AvailableSeats are required",
      });
    }

    const bus = await Bus.create({
      BusNumber,
      TotalSeats,
      AvailableSeats,
    });

    console.log(`Bus inserted successfully. ID: ${bus.Id}, BusNumber: ${bus.BusNumber}`);

    res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Error inserting bus:", error);

    res.status(500).json({
      message: "Failed to create bus",
      error: error.message,
    });
  }
};

// GET /buses/available/:seats
const getAvailableBuses = async (req, res) => {
  try {
    const { seats } = req.params;

    const buses = await Bus.findAll({
      where: {
        AvailableSeats: {
          [Op.gt]: Number(seats),
        },
      },
    });

    console.log(`Retrieved buses with more than ${seats} available seats.`);

    res.status(200).json(buses);
  } catch (error) {
    console.error("Error retrieving buses:", error);

    res.status(500).json({
      message: "Failed to retrieve buses",
      error: error.message,
    });
  }
};

export { createBus, getAvailableBuses };

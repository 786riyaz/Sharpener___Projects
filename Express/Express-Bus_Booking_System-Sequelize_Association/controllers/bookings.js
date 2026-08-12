import Booking from "../models/bookings.js";
import User from "../models/users.js";
import Bus from "../models/buses.js";

const createBooking = async (req, res) => {
  try {
    const { userId, busId, seatNumber } = req.body;

    if (
      userId === undefined ||
      busId === undefined ||
      seatNumber === undefined
    ) {
      return res.status(400).json({
        message: "userId, busId and seatNumber are required",
      });
    }

    const parsedUserId = Number(userId);
    const parsedBusId = Number(busId);
    const parsedSeatNumber = Number(seatNumber);

    if (
      !Number.isInteger(parsedUserId) ||
      !Number.isInteger(parsedBusId) ||
      !Number.isInteger(parsedSeatNumber)
    ) {
      return res.status(400).json({
        message: "userId, busId and seatNumber must be integers",
      });
    }

    const user = await User.findByPk(parsedUserId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const bus = await Bus.findByPk(parsedBusId);
    if (!bus) {
      return res.status(404).json({
        message: "Bus not found",
      });
    }

    if (
      parsedSeatNumber < 1 ||
      parsedSeatNumber > bus.TotalSeats
    ) {
      return res.status(400).json({
        message: `seatNumber must be between 1 and ${bus.TotalSeats}`,
      });
    }

    if (bus.AvailableSeats <= 0) {
      return res.status(400).json({
        message: "No seats are available on this bus",
      });
    }

    const existingBooking = await Booking.findOne({
      where: {
        BusId: parsedBusId,
        SeatNumber: parsedSeatNumber,
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This seat is already booked on this bus",
      });
    }

    const booking = await Booking.create({
      UserId: parsedUserId,
      BusId: parsedBusId,
      SeatNumber: parsedSeatNumber,
    });

    // Reduce available seats after successful booking.
    await bus.update({
      AvailableSeats: bus.AvailableSeats - 1,
    });

    const bookingWithAssociations = await Booking.findByPk(booking.Id, {
      include: [
        {
          model: User,
          attributes: ["Id", "Name", "Email"],
        },
        {
          model: Bus,
          attributes: ["Id", "BusNumber", "TotalSeats", "AvailableSeats"],
        },
      ],
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking: bookingWithAssociations,
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    return res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

export { createBooking };

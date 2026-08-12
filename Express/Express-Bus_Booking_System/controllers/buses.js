import db from "../db/database.js";


// POST /buses
const createBus = async (req, res) => {
  try {
    const {
      BusNumber,
      TotalSeats,
      AvailableSeats,
    } = req.body;

    if (!BusNumber || TotalSeats === undefined || AvailableSeats === undefined) {
      return res.status(400).json({
        message: "BusNumber, TotalSeats and AvailableSeats are required",
      });
    }

    const query = `
      INSERT INTO Buses (
        BusNumber,
        TotalSeats,
        AvailableSeats
      )
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      BusNumber,
      TotalSeats,
      AvailableSeats,
    ]);

    console.log(
      `Bus inserted successfully. ID: ${result.insertId}, BusNumber: ${BusNumber}`
    );

    res.status(201).json({
      message: "Bus created successfully",
      busId: result.insertId,
      BusNumber,
      TotalSeats,
      AvailableSeats,
    });
  } catch (error) {
    console.error("Error inserting bus:", error);

    res.status(500).json({
      message: "Failed to create bus",
    });
  }
};


// GET /buses/available/:seats
const getAvailableBuses = async (req, res) => {
  try {
    const { seats } = req.params;

    const query = `
      SELECT *
      FROM Buses
      WHERE AvailableSeats > ?
    `;

    const [buses] = await db.execute(query, [seats]);

    console.log(
      `Retrieved buses with more than ${seats} available seats.`
    );

    res.status(200).json(buses);
  } catch (error) {
    console.error("Error retrieving buses:", error);

    res.status(500).json({
      message: "Failed to retrieve buses",
    });
  }
};


export {
  createBus,
  getAvailableBuses,
};
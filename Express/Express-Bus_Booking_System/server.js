import express from "express";
import mysql from "mysql2";

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "gsrtc",
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Connection has been created!");

  const createUsersTable = `
  CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(40),
    Email VARCHAR(40)
  )
`;

const createBusesTable = `
  CREATE TABLE IF NOT EXISTS Buses (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    BusNumber VARCHAR(40),
    TotalSeats INT,
    AvailableSeats INT
  )
`;

const createBookingsTable = `
  CREATE TABLE IF NOT EXISTS Bookings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    SeatNumber INT
  )
`;

const createPaymentsTable = `
  CREATE TABLE IF NOT EXISTS Payments (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    AmountPaid INT,
    PaymentStatus VARCHAR(10)
  )
`;

connection.query(createUsersTable, (err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log("Users table created.");

  connection.query(createBusesTable, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("Buses table created.");

    connection.query(createBookingsTable, (err) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log("Bookings table created.");

      connection.query(createPaymentsTable, (err) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log("Payments table created.");
      });
    });
  });
});
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on 3000 port locally");
});

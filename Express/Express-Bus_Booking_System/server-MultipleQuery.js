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
    console.error("Database connection failed:", err);
    return;
  }

  console.log("Connection has been created!");

  const creationQuery = `
    CREATE TABLE IF NOT EXISTS Users (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(40),
      Email VARCHAR(40)
    );

    CREATE TABLE IF NOT EXISTS Buses (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      BusNumber VARCHAR(40),
      TotalSeats INT,
      AvailableSeats INT
    );

    CREATE TABLE IF NOT EXISTS Bookings (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      SeatNumber INT
    );

    CREATE TABLE IF NOT EXISTS Payments (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      AmountPaid INT,
      PaymentStatus VARCHAR(10)
    );
  `;

  connection.query(creationQuery, (err) => {
    if (err) {
      console.error("Error creating tables:", err);
      return;
    }

    console.log("All tables created successfully!");
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on 3000 port locally");
});
import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "gsrtc",
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  console.log("Database connected successfully!");

  connection.release();
});

export default pool.promise();

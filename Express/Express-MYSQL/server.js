import express from "express";
import mysql from "mysql2";

const app = express();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "testdb",
});

connection.connect((err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Connection has been created!");

  const creationQuery = `CREATE TABLE Students (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(40),
  Email VARCHAR(40)
  )`;

  connection.execute(creationQuery, (err)=>{
    if(err){
        console.error(err);
    }
    console.log("Student Table Created.");
  })
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on 3000 port locally");
});

import express from "express";
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send(`Hello, World!`);
});

app.get("/welcome/:username", (req, res) => {
  const username = req.params.username;
  let role = req.query.role;
  res.send(`Hello, ${username}! Your Role is ${role || "Guest"}!`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

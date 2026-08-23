import express from "express";
import path from "node:path";

const app = express();

app.use(express.static(path.join(import.meta.dirname, "public")));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome Page!");
});

app.get("/user/register", (req, res) => {
    res.sendFile(
        path.join(import.meta.dirname, "public", "register.html")
    );
});

app.post("/user/register", (req, res) => {
    console.log(req.body);
    res.send("User Registration Completed.");
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
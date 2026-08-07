const express = require('express');
const app = express();
let port=3001;

// Autentication Middleware
app.use((req, res, next) => {
    console.log('Authentication Middleware: Checking authentication...');
    next();
});

app.use("/library2", (req, res, next) => {
    console.log('Library2 Middleware: Book Recommendations...');
    next();
});

app.get("/library2", (req, res) => {
    res.send("Welcome to Library2! Here are some book recommendations.");
});

app.use("/library3", (req, res, next) => {
    console.log('Library3 Middleware: Special Access to research papers...');
    next();
});

app.get("/library3", (req, res) => {
    res.send("Welcome to Library3! Special access to research papers.");
});

app.get("/welcome", (req, res) => {
    res.send("Welcome to the Welcome Page!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


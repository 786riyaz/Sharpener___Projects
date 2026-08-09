import express from 'express';
let app = express();

app.get('/orders', (req, res) => {
    res.send('Here is the list of all orders.');
});

app.post('/orders', (req, res) => {
    res.send('A new order has been created.');
});

app.get('/users', (req, res) => {
    res.send('Here is the list of all users.');
});

app.post('/users', (req, res) => {
    res.send('A new user has been added.');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

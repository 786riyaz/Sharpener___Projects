/*
Wildcard Route:
Use a wildcard route (*) to handle all undefined routes and return the following custom error page as HTML:<h1>404 - Page Not Found</h1>
Also add the status as 404.
*/

import express from 'express';

const app = express();

app.use(loggingMiddleware);

app.get('/products', (req, res) => {
  res.send('Here is the list of all products.');
});

app.post('/products', (req, res) => {
  res.send('A new product has been added.');
});

app.get('/categories', (req, res) => {
  res.send('Here is the list of all categories.');
});

app.post('/categories', (req, res) => {
  res.send('A new category has been created.');
});

app.use((req, res) => {
// app.use('*',(req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});

function loggingMiddleware(req, res, next) {
  console.log(`${req.method} request made to ${req.url}`);
  next();
}
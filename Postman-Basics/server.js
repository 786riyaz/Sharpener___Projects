import express from 'express';

let app = express();

let studentData = [
  { id: 1, name: 'John Doe', age: 20 },
  { id: 2, name: 'Jane Smith', age: 22 },
  { id: 3, name: 'Alice Johnson', age: 19 }
];
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/students', (req, res) => {
  res.json(studentData);
});

app.get('/students/:id', (req, res) => {
  const student = studentData.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).send('Student not found');
  }
  res.json(student);
});

app.post('/students', (req, res) => {
  // Handle form submission logic here
  studentData.push({ id: studentData.length + 1, name: req.body.name, age: req.body.age });
  res.send('Student added successfully!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
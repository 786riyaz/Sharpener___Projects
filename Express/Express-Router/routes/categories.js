import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Here is the list of all categories.');
});

router.post('/', (req, res) => {
  res.send('A new category has been created.');
});

export default router;
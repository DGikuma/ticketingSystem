import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  // Your login logic
  res.status(200).json({ message: 'Login successful' });
});

export default router;

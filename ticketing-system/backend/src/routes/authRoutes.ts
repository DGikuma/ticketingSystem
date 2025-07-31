import express from 'express';
import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  console.log("🔐 Login route hit with:", req.body);
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    console.log("🧑‍💻 DB user:", user);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password entered:', password);
    console.log('🔒 Password in DB:', user.password);

    if (!isMatch) {
      console.log(`❌ Password mismatch for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 🔁 Rehash password with bcryptjs if needed
    const newHash = await bcrypt.hash(password, 10);
    if (newHash !== user.password) {
      await db.query('UPDATE users SET password = $1 WHERE id = $2', [newHash, user.id]);
      console.log(`🔁 Rehashed password for ${email}`);
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: '7d' });

    await db.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [user.id, refreshToken]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Server error during login:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 📝 REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      [name, email, hashed, role || 'user']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Server error during registration:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 🔁 REFRESH
router.post('/refresh', async (req, res) => {
  const refresh = req.cookies?.refreshToken;
  if (!refresh) return res.status(401).json({ error: 'Missing refresh token' });

  try {
    const payload = jwt.verify(refresh, process.env.REFRESH_SECRET!) as any;

    // Optional: Check if token is still valid in DB
    const result = await db.query('SELECT * FROM refresh_tokens WHERE token = $1', [refresh]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccess = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    res.json({ token: newAccess });
  } catch (err) {
    console.error('❌ Refresh token error:', err);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// 🔓 LOGOUT
router.post('/logout', async (req, res) => {
  const refresh = req.cookies?.refreshToken;
  if (refresh) {
    await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refresh]);
    res.clearCookie('refreshToken');
  }
  res.json({ message: 'Logged out' });
});

export default router;

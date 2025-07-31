import express from 'express';
import { db } from '../db';

const router = express.Router();
router.get('/agents', async (_, res) => {
    const [agents] = await db.execute('SELECT id, name FROM users WHERE role = \"agent\"');
    res.json(agents);
});
router.get('/:id', async (req, res) => {
    const [[user]] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
});
export default router;

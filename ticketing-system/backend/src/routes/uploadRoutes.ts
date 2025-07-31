import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads/'),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });

router.post('/file', upload.single('file'), (req, res) => {
  res.json({
    filename: req.file?.filename,
    path: `/uploads/${req.file?.filename}`,
  });
});

export default router;

import express from 'express';
import { uploadGymFiles, deleteGymFile } from '../controllers/fileController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/gym/:gymId/upload', authenticateToken, upload.array('files', 10), uploadGymFiles);
router.delete('/gym/:gymId/delete', authenticateToken, deleteGymFile);

export default router;
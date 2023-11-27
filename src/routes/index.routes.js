import {Router} from 'express';
import {io} from '../index';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/1', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

export default router;

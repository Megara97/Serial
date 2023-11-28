import {Router} from 'express';
import {sendPage, sendWeight} from '../controllers/index.controllers';

const router = Router();

router.get('/', sendPage);

router.get('/weight', sendWeight);

export default router;

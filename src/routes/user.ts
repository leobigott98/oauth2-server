import { Router } from 'express';
import { updateUserDetails, getUserInfo } from '../controllers/userController';

const router = Router();

router.put('/update', updateUserDetails);
router.post('/info', getUserInfo);

export default router;

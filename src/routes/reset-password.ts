import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

router.get('^/$|/index(.html)?', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../views', 'reset-password.html'));
});

export default router;
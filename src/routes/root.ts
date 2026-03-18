import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

router.get('^/$|/index(.html)?', (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'src', 'views', 'index.html'));
});

export default router;
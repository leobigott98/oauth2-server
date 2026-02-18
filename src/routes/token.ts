import { Router, Request, Response, NextFunction } from 'express';
import passport from '../services/strategies';
import oauth2orizeServer from '../services/oauth2Service';

const router = Router();

// Token endpoint

router.post(
    '/',
    (req: Request, res: Response, next: NextFunction) => {
        console.log('Token endpoint hit');
        next();
    },
    passport.authenticate(['basic'], { session: false }),
    oauth2orizeServer.token(),
    oauth2orizeServer.errorHandler()
);

export default router;
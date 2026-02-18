import { Router, Request, Response, NextFunction } from 'express';
import passport from '../oauth2/strategies';
import oauth2orizeServer from '../oauth2/oauth2';
import { getClient } from '../auth/model';

const router = Router();

/* //Debug route
router.get('/authorize', (req, res) => {
    res.send('Authorize route is working!');
}); */

// Authorization endpoint
router.get('/authorize', 
    (req: Request, res: Response, next: NextFunction) => {
        // Simulated logged-in user
        req.user = { id: '1', username: 'test' };
        console.log('User authenticated:', req.user);
        next();
    }, 
    oauth2orizeServer.authorize((clientId, redirectUri, done) => {
        console.log('Authorization middleware triggered');
        const client = getClient(clientId);
        if (client && client.redirectUri === redirectUri) {
            console.log('Client and redirect URI validated');
            return done(null, client, redirectUri);
        }
        console.error('Client validation failed');
        return done(null, false);
    }),
    (req: Request, res: Response, next: NextFunction) => {
        // Simulate user granting consent
        console.log('Consent auto-approved for testing');
        req.body = { decision: 'allow' }; // Simulate user decision
        next();
    },
    oauth2orizeServer.decision()
);

// Token endpoint
/* router.post('/token', passport.authenticate(['basic'], { session: false }), oauth2orizeServer.token()); */

router.post(
    '/token',
    (req: Request, res: Response, next: NextFunction) => {
        console.log('Token endpoint hit');
        next();
    },
    passport.authenticate(['basic'], { session: false }),
    oauth2orizeServer.token(),
    oauth2orizeServer.errorHandler()
);

export default router; 

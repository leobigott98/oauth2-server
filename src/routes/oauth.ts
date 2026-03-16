import { getClient } from '../services/clientService';
import oauth2orizeServer from '../services/oauth2Service';
import { Router, Request, Response, NextFunction } from 'express';
import passport from '../services/strategies';

const router = Router()

// **Authorization Code Grant - Step 1 (User Authorization Request)**
router.get('/authorize', 
    (req: Request, res: Response, next: NextFunction) => {
        // Simulated logged-in user (Replace this with actual session authentication)
        req.user = { id: '1', username: 'test' };
        console.log('User authenticated:', req.user);
        next();
    }, 

    oauth2orizeServer.authorize(async (clientId, redirectUri: string, done: any) => {
        console.log('Authorization middleware received');
        const client = await getClient(clientId);
        if (client && client.redirectUri.includes(redirectUri)) {
            console.log('Client and redirect URI validated');
            return done(null, client, redirectUri);
        }
        console.error('Client validation failed');
        return done(null, false);
    }),

    (req, res, next) => {
        // Simulate user granting consent (Auto-approving for now)
        console.log('Consent auto-approved for testing');
        req.body = { decision: 'allow' }; // Simulate user decision
        next();
    },
    oauth2orizeServer.decision()
);

/* Token Exchange (Authorization Code → Access Token)
Password Grant, Authorization Code, Refresh Token, etc
*/
router.post('/token', 
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    oauth2orizeServer.token(), 
    oauth2orizeServer.errorHandler()
);

export default router;
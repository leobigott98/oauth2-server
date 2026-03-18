import { getClient } from '../services/clientService';
import oauth2orizeServer from '../services/oauth2Service';
import { Router } from 'express';
import passport from '../services/strategies';
import { simulateUserLogin, autoApproveConsent } from '../controllers/oauthController';

const router = Router()

// **Authorization Code Grant - Step 1 (User Authorization Request)**
router.get('/authorize', 
    simulateUserLogin, // ⬅️ Nuestro middleware limpio
    oauth2orizeServer.authorize(async (clientId, redirectUri: string, done: any) => {
        const client = await getClient(clientId);
        if (client && client.redirectUri.includes(redirectUri)) {
            return done(null, client, redirectUri);
        }
        console.error('Client validation failed');
        return done(null, false);
    }),
    autoApproveConsent, // ⬅️ Nuestro middleware limpio con Consentimiento automático para pruebas
    oauth2orizeServer.decision()
);

//Token Exchange (Authorization Code → Access Token, Password Grant, etc)
router.post('/token', 
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    oauth2orizeServer.token(), 
    oauth2orizeServer.errorHandler()
);

export default router;
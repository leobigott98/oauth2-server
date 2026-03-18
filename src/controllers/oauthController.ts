import { Request, Response, NextFunction } from 'express';

// Middleware simulado para inyectar al usuario (Luego lo cambiaremos por JWT real)
export const simulateUserLogin = (req: Request, res: Response, next: NextFunction) => {
    req.user = { id: '1', username: 'test' };
    console.log('User authenticated:', req.user);
    next();
};

// Middleware simulado para aprobar el consentimiento (Luego será un HTML con botones Yes/No)
export const autoApproveConsent = (req: Request, res: Response, next: NextFunction) => {
    console.log('Consent auto-approved for testing');
    req.body = { decision: 'allow' }; 
    next();
};
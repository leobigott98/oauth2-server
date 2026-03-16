// Import dependencies
import { Router } from 'express';
import { signUp, verifyEmail, requestNewOtp, requestPasswordReset, resetPassword } from '../controllers/authController';

const router = Router();

// Endpoints de registro y validación
router.post('/sign-up', signUp);
router.post('/verify-email', verifyEmail);
router.post('/request-new-otp', requestNewOtp);

// Endpoints de recuperación de contraseña
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router; 
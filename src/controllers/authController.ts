import { Request, Response } from 'express';
import { registerUser, verifyUserEmailAccount } from '../services/authService';
import logger from '../utils/logger'; 
import { resendVerificationOtp, processPasswordResetRequest, updateUserPassword } from '../services/authService';
import { isValidEmail } from '../utils/stringValidations';

export const signUp = async (req: Request, res: Response) => {
    try {
        // Get user data from request
        const { email, password, name, lastname, role } = req.body;
        const scopes = req.body.scopes || []; // Ensures scopes is always an array

        logger.info(`Sign-up request received for email: ${email}`);

        // Llamamos a nuestro Service para manejar la lógica de registro
        const user = await registerUser({ email, password, name, lastname, role, scopes });

        // Si el registro es exitoso, respondemos con un mensaje de éxito
        res.status(201).json({ message: 'User registered successfully', userId: user._id });

    } catch (err: any) {
        logger.error(`Error during sign-up for email: ${req.body.email} - ${err.message}`);

        // Manejamos los errores específicos que lanzó nuestro Service
        if (err.message === 'USER_ALREADY_EXISTS') {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (err.message === 'INVALID_USER_DATA') {
            return res.status(400).json({ message: 'Not valid user data' });
        }

        // Si es un error desconocido (base de datos caída, etc.)
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        logger.info(`Email verification request received for: ${email}`);

        // Validación básica (Controller)
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        // Delegamos la lógica al Service
        await verifyUserEmailAccount(email, otp);

        // Si no arrojó errores, todo salió bien
        res.status(200).json({ message: 'Email verified successfully' });

    } catch (err: any) {
        logger.error(`Error during email verification for ${req.body.email}: ${err.message}`);

        // Traducimos los errores del Service a respuestas HTTP
        if (err.message === 'INVALID_OTP') {
            return res.status(400).json({ message: 'Not valid OTP' });
        }
        if (err.message === 'USER_NOT_FOUND') {
            return res.status(400).json({ message: 'Not valid email or user not found' });
        }

        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};

export const requestNewOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'Not valid email' });

        await resendVerificationOtp(email);
        res.status(200).json({ message: 'OTP sent' });
    } catch (err: any) {
        if (err.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'No user found' });
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        await processPasswordResetRequest(email);
        res.status(200).json({ message: 'Reset link sent to email' });
    } catch (err: any) {
        if (err.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'No user found' });
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await updateUserPassword(email, token, newPassword);
        res.status(200).json({ message: 'Password reset successful' });
    } catch (err: any) {
        if (err.message === 'USER_NOT_FOUND') return res.status(404).json({ message: 'User not found' });
        // Si verifyPasswordResetToken falla, atrapará el error aquí
        res.status(400).json({ error: 'Invalid or expired token', message: err.message });
    }
};
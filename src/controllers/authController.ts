import { Request, Response } from 'express';
import { registerUser } from '../services/authService';
import logger from '../utils/logger'; 

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
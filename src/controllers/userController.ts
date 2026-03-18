import { Request, Response } from 'express';
import { updateUser } from '../services/userService';
import User from '../models/User';
import { isValidEmail } from '../utils/stringValidations';

export const updateUserDetails = async (req: Request, res: Response) => {
    try {
        const { email, name, lastname, role } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        if (!name && !lastname && !role) {
            return res.status(400).json({ error: 'At least one field is required for update' });
        }

        const updatedUser = await updateUser(email, req.body);
        if (!updatedUser) {
            return res.status(400).json({ error: 'Update failed' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getUserInfo = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Not valid email' });
        }

        const user = await User.findOne({ email }).select('-password'); // Excluimos la contraseña por seguridad
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Get user info error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
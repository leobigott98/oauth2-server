import { Router, Request, Response } from 'express';
import { updateUser } from '../services/userService';

const router = Router();

// **Update User Details**
router.put('/update', async (req: Request, res: Response) => {
    try {

        // Validate input (Add more validation as needed)
        if (!req.body.email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const email = req.body.email;

        if (!req.body.name && !req.body.lastname && !req.body.role) {
            return res.status(400).json({ error: 'At least one field (name, lastname, role) is required for update' });
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
});

export default router;

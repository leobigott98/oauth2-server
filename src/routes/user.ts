import { Router, Request, Response } from 'express';
const { updateUser } = require('../../services/userService');

const router = Router();

// **Update User Details**
router.put('/update', async (req: Request, res: Response) => {
    try {
        const updatedUser = await updateUser(req.body);
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

const express = require('express');
const { updateUser } = require('../services/userService');

const router = express.Router();

// **Update User Details**
router.put('/update', async (req, res) => {
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

module.exports = router;

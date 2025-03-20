// Import dependencies
const express = require('express');
const oauth2orizeServer = require('../services/oauth2Service');
const getClient = require('../services/clientService');
const {getUserByEmail, createUser} = require('../services/userService');
const router = express.Router();
const bcrypt = require('bcrypt');

// User Sign-Up
router.post('/sign-up', async(req, res)=>{
    try {
        // Get user data from request
        const { email, password, name, lastname, role, scopes } = req.body;

        // Check if the user already exists
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store 
        const user = await createUser({email, password, name, lastname, role, scopes});

        res.status(201).json({ message: 'User registered successfully', userId: user._id });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
        
    }
});
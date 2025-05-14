// Import dependencies
const express = require('express');
const oauth2orizeServer = require('../services/oauth2Service');
const getClient = require('../services/clientService');
const passport = require('../services/strategies');
const { getUserByEmail, createUser, verifyEmail } = require('../services/userService');
const bcrypt = require('bcrypt');
const { verifyOTP, generateOTP, saveOTP } = require('../services/otpService');
const { sendMail } = require('../utils/sendEmail');
const { generatePasswordResetToken, verifyPasswordResetToken } = require('../services/passwordResetService');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { isValidEmail } = require('../utils/stringValidations');

const router = express.Router();

// User Sign-Up
router.post('/sign-up', async(req, res)=>{
    try {
        // Get user data from request
        const { email, password, name, lastname, role } = req.body;
        const scopes = req.body.scopes || []; // Ensures scopes is always an array

        // Check if the user already exists
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store 
        const user = await createUser({email, password: hashedPassword, name, lastname, role, scopes});

        if(user){
            // Generate OTP
            const otp = await generateOTP();
            if(!otp) throw new Error ('Error generating OTP');

            //Save OTP
            const savedOTP = await saveOTP(otp, email);
            if(!savedOTP) throw new Error('Error storing OTP');

            // Send OTP
            const emailId = sendMail(email, 'Validación de Correo', `<h1>Bienvenido a Migo</h1><h2>Valide su correo electrónico</h2><p>Introduce la siguiente Clave Temporal (OTP) en la App para completar tu registro:</p><p><b>${otp}</b><p>`);
            if (!emailId) throw new Error ('Error sending email');

            // Send successful response
            res.status(201).json({ message: 'User registered successfully', userId: user._id });
        }else{
            res.status(400).json({message: 'Not valid user data'});
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
        
    }
});

// OAuth 2 Password Grant (Login)
router.post('/token', passport.authenticate(['basic'], { session: false }), oauth2orizeServer.token(), oauth2orizeServer.errorHandler());


// Validate Email
router.post('/verify-email', async(req, res)=>{
    try {
        // Get email from request
        const {email, otp} = req.body;

        // Verify OTP
        const verified = await verifyOTP(otp, email);

        console.log(verified)

        if(!verified){
            return res.status(400).json({message: 'Not valid OTP'});
        }

        // Verify email
        const user = await verifyEmail(email);

        if(user){
            res.status(200).json({message: 'Email verified successfully'});
        }else{
            res.status(400).json({message: 'Not valid email'});
        }
        
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Internal server error', message: err.message})
        
    }

});

router.post('/request-new-otp', async(req,res)=>{
    try {
        const { email } = req.body;


        // Check if valid email
        if(!email || !isValidEmail(email)) return res.status(400).json({message: 'Not valid email'});

        // Check if user exists
        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message: 'No user found'});

        //Generate new OTP
        const otp = await generateOTP();
        if(!otp) throw new Error('Error generating OTP');

        // Store OTP
        const storedOTP = await saveOTP(otp, email);
        if(!storedOTP) throw new Error('Error storing OTP');

        // Send OTP
        const emailId = sendMail(email, 'Validación de Correo', `<h1>Bienvenido a Migo</h1><h2>Valide su correo electrónico</h2><p>Introduce la siguiente Clave Temporal (OTP) en la App para completar tu registro:</p><p><b>${otp}</b><p>`);
        if (!emailId) throw new Error ('Error sending email');

        // Send successful response
        return res.status(200).json({ message: 'OTP sent'});
        
    } catch (err) {
        console.error('Error requesting new OTP', err);
        return res.status(500).json({error: 'Internal server error', message: err.message});
        
    }
})

router.post('/request-password-reset', async(req, res)=>{
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });
    
        const user = User.find({email});
    
        if(!user) return res.status(401).json({message: 'No user found'});
    
        const token = await generatePasswordResetToken(email);
    
        const resetUrl = `http://192.168.100.167:4000/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
        await sendMail(email,'Reset your password',`<p>Click the link to reset your password: ${resetUrl}<p>`);
    
        return res.status(200).json({ message: 'Reset link sent to email' });
        
    } catch (err) {
        console.error('Error requesting password reset', err);
        return res.status(500).json({error: 'Internal Server Error', message: err.message});
        
    }

});

router.post('/reset-password', async(req, res)=>{
    try {
        const { email, token, newPassword } = req.body;

        // Check if user existis
        const user = await User.findOne({ email });
        if (!user) res.status(401).json({message: 'User not found'});

        // Verify token
        await verifyPasswordResetToken(token, email);

        // Hash and update password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        //Invalidate sessions
        await RefreshToken.updateMany({user_id: user._id}, {revoked: true});

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

router.post('/user-info', async(req, res)=>{
    try {
        const { email } = req.body;

        // Validate email
        if(!email) return res.status(400).json({ message: 'Email is required'});
        if (!isValidEmail(email)) return res.status(400).json({ message: 'Not valid email'});

        const user = await User.findOne({email})

        
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', meesage: err.message});
    }
})


module.exports = router; 
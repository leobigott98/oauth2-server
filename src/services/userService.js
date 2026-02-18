const User = require('../models/User');
const { isValidEmail, isValidName } = require('../utils/stringValidations');
const { getScopeIds } = require('../services/scopeService');

async function getUserByEmail(email){
    try {
        return await User.findOne({email}).exec();   
    } catch (err) {
        console.error('Error fetching user:', err);
        return null;
    }
};

async function createUser({email, password, name, lastname, role, scopes}){
    try {

        // Validate email
        if(!isValidEmail(email)) throw new Error('Not valid email');

        // Validate name
        if(!isValidName(name) || !isValidName(lastname)) throw new Error('Not valid name or lastname');

        // Validate role
        if(role !== 'admin' && role !== 'user') throw new Error('Not valid role');

        // Get scope IDs if provided
        let scopeIds = [];
        if (Array.isArray(scopes) && scopes.length > 0) {
            scopeIds = await getScopeIds(scopes);
        }

        const createdAt = new Date();

        return await User.create({email, password, name, lastname, role,  createdAt, scopes: scopeIds });   

    } catch (err) {
        console.error('Error inserting user:', err);
        return null;
        
    }
};

async function updateUser({ email, name, lastname, role, scopes }){
    try {
        if (!email) throw new Error('Email is required for updating user');

        const userData = { name, lastname, role, scopes };
        const cleanedUserData = {};

        for (const key in userData) {
            if (userData[key]) {
                cleanedUserData[key] = userData[key];
            }
        }

        // Validate fiels
        if (email && !isValidEmail(email)) throw new Error('Not valid email');
        if (name && !isValidName(name)) throw new Error('Not valid name');
        if (lastname && !isValidName(lastname)) throw new Error('Not valid lastname');
        if (role && role !== 'admin' && role !== 'user') throw new Error('Not valid role');

        // Check if email exists
        const existingEmail = await getUserByEmail(email);
        if(!existingEmail) throw new Error('No user was found')

        // Get scope IDs if scopes are provided
        if (scopes && Array.isArray(scopes) && scopes.length > 0) {
            cleanedUserData.scopeIds = await getScopeIds(scopes);
        }

        // Check if there are fiels to update
        if (Object.keys(cleanedUserData).length === 0) {
            throw new Error('No valid fields to update');
        }

        return await User.updateOne({ email }, { $set: cleanedUserData });

        
    } catch (err) {
        console.error('Error updating user:', err);
        return null;
    }
}

async function verifyEmail(email){
    try{
        // Check if email was sent
        if (!email) throw new Error('Email is required for updating user');

        // Validate email
        if (email && !isValidEmail(email)) throw new Error('Not valid email');

        // Check if user exists
        existingUser = getUserByEmail(email);
        if(!existingUser) throw new Error('User not found');

        return await User.updateOne({ email }, { verifiedEmail: true});

    }catch(err){
        console.error('Error validating user email:', err);
        return null;
    }
}

module.exports = { getUserByEmail, createUser, updateUser, verifyEmail };
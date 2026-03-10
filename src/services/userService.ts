import User, { IUser } from '../models/User'; // Importamos el modelo y su Interfaz
import { isValidEmail, isValidName } from '../utils/stringValidations';
import { getScopeIds } from './scopeService';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

interface CreateUserParams {
    email: string;
    password?: string;
    name: string;
    lastname: string;
    role: "user" | "admin";
    scopes?: string[];
}

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
    try {
        return await User.findOne({email}).exec();   
    } catch (err) {
        console.error('Error fetching user:', err);
        return null;
    }
};

export const createUser = async ({email, password, name, lastname, role, scopes}: CreateUserParams): Promise<IUser | null> => {
    try {

        // Validate email
        if(!isValidEmail(email)) throw new Error('Not valid email');

        // Validate name
        if(!isValidName(name) || !isValidName(lastname)) throw new Error('Not valid name or lastname');

        // Validate role
        if(role !== 'admin' && role !== 'user') throw new Error('Not valid role');

        // Get scope IDs if provided
        let scopeIds: mongoose.Types.ObjectId[] | null = [];
        if (scopes && Array.isArray(scopes) && scopes.length > 0) {
            scopeIds = await getScopeIds(scopes);
        }

        const createdAt = new Date();
        const user_id = uuidv4();

        return await User.create({ user_id, email, password, name, lastname, role,  createdAt, scopes: scopeIds });   

    } catch (err) {
        console.error('Error inserting user:', err);
        return null;   
    }
};

export const verifyEmail = async(email: string) =>{
    try{
        // Check if email was sent
        if (!email) throw new Error('Email is required');

        // Validate email
        if (!isValidEmail(email)) throw new Error('Not valid email');

        // Check if user exists
        const existingUser = getUserByEmail(email);
        if(!existingUser) throw new Error('User not found');

        return await User.updateOne({ email }, { verifiedEmail: true});

    }catch(err){
        console.error('Error validating user email:', err);
        return null;
    }
}

module.exports = { getUserByEmail, createUser, verifyEmail };
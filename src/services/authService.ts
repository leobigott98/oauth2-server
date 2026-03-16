// import dependencies
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, verifyEmail } from './userService';
import { generateOTP, saveOTP, verifyOTP } from './otpService';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { generatePasswordResetToken, verifyPasswordResetToken } from './passwordResetService';
import sendMail from '../utils/emailService';

export const registerUser = async (userData: any) => {
    const { email, password, name, lastname, role, scopes } = userData;

    // 1. Check if the user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        throw new Error('USER_ALREADY_EXISTS'); // Lanzamos un error controlado
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user
    const user = await createUser({ email, password: hashedPassword, name, lastname, role, scopes });
    if (!user) {
        throw new Error('INVALID_USER_DATA');
    }

    // 4. OTP logic and email sending
    const otp = await generateOTP();
    if (!otp) throw new Error('OTP_GENERATION_FAILED');

    const savedOTP = await saveOTP(otp, email);
    if (!savedOTP) throw new Error('OTP_SAVE_FAILED');

    const emailId = sendMail(
        email, 
        'Validación de Correo', 
        `<h1>Bienvenido a Migo</h1><h2>Valide su correo electrónico</h2><p>Introduce la siguiente Clave Temporal (OTP) en la App para completar tu registro:</p><p><b>${otp}</b></p>`
    );
    if (!emailId) throw new Error('EMAIL_SEND_FAILED');

    return user;
};

export const verifyUserEmailAccount = async (email: string, otp: string) => {
    // 1. Verify the OTP
    const isOtpValid = await verifyOTP(otp, email);
    if (!isOtpValid) {
        throw new Error('INVALID_OTP');
    }

    // 2. Mark the email as verified in the users database
    const user = await verifyEmail(email);
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    return user;
};

// Re-send OTP
export const resendVerificationOtp = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('USER_NOT_FOUND');

    const otp = await generateOTP();
    if (!otp) throw new Error('OTP_GENERATION_FAILED');

    const storedOTP = await saveOTP(otp, email);
    if (!storedOTP) throw new Error('OTP_SAVE_FAILED');

    const emailId = sendMail(
        email, 
        'Validación de Correo', 
        `<h1>Bienvenido a Migo</h1><h2>Valide su correo electrónico</h2><p>Introduce la siguiente Clave Temporal (OTP) en la App para completar tu registro:</p><p><b>${otp}</b></p>`
    );
    if (!emailId) throw new Error('EMAIL_SEND_FAILED');

    return true;
};

// Initiate Password Reset
export const processPasswordResetRequest = async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('USER_NOT_FOUND');

    const token = await generatePasswordResetToken(email);
    // variable de entorno con IP y puerto del frontend
    const resetUrl = `http://192.168.100.3:4000/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    await sendMail(email, 'Reset your password', `<p>Click the link to reset your password: ${resetUrl}</p>`);
    
    return true;
};

// Execute Password Reset
export const updateUserPassword = async (email: string, token: string, newPassword: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('USER_NOT_FOUND');

    // This will throw an error if the token is invalid or expired
    await verifyPasswordResetToken(token, email);

    // Encrypt the new password and save it
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Invalidate all existing refresh tokens for this user
    await RefreshToken.updateMany({ user_id: user._id }, { revoked: true });

    return true;
};
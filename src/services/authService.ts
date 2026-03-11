// import dependencies
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from './userService';
import { generateOTP, saveOTP } from './otpService';
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
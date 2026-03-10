import crypto from 'crypto';
import PasswordResetToken from '../models/PasswordResetToken';

export const generatePasswordResetToken = async (email: string) => {
  try {
    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 10); // 10 mins

    // Optional: delete existing tokens for this email
    await PasswordResetToken.deleteMany({ email });

    // Save hash to DB
    await PasswordResetToken.create({ email, token: tokenHash, expiry });

    return rawToken; // return raw token to email to user
    
  } catch (err) {
    console.error('Error generating Password Reset Token', err);
    return null;
  }
  
};

export const verifyPasswordResetToken = async (token: string, email: string) => {
  try {
    // Hash received token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find token hash
    const record = await PasswordResetToken.findOne({ email, tokenHash });
    if (!record || record.expiry < new Date()) {
      throw new Error('Invalid or expired token');
    }

    // Valid token, now delete it so it can’t be reused
    await PasswordResetToken.deleteOne({ _id: record._id });
    return true;
  
  } catch (err) {
    console.error('Error verifying Password Reset Token', err);
    return null;
  } 
};
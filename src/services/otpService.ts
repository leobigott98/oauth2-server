// Import dependencies
import bcrypt from 'bcryptjs';
import OTP, {IOTP} from '../models/OTP';

const nanoid = async (alphabet: string, number: number)=> { 
  const { customAlphabet } = await import('nanoid');
  const generate = customAlphabet(alphabet, number);
  return generate();
}

// Custom alphabet to generate only 6-digit OTPs
const alphabet = "0123456789";

// Generate OTP
export const generateOTP = async() => {
  try {
    const otp = await nanoid(alphabet, 6);
    console.log("Generated OTP:", otp);
    return otp;
  } catch (err) {
    console.error("Error generating OPT:", err);
    return null;
  }
};

// Save OTP to database
export const saveOTP = async (otp: string, email: string) => {
  try {
    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Save
    const savedOTP = await OTP.create({ email, otp: hashedOTP });
    console.log("Saved OTP:", savedOTP);
    return savedOTP;

  } catch (err) {
    console.error("Error saving OTP:", err);
    return null;
  }
};

// Delete all expired OTPs
export const deleteExpiredOTPs = async () => {
  try {
    const result = await OTP.deleteMany({ expiry: { $lte: Date.now() } });
    console.log(`${result.deletedCount} otps deleted`);
  } catch (err) {
    console.error("Error deleting expired OTPs:", err);
    return null;
  }
};

// Verify OTPs given an email
export const verifyOTP = async (otp: string, email: string) => {
  try {
    // Retrieve all OTPs under an email
    const retrievedOtp: IOTP[] | null = await OTP.find({ email }).sort({ expiry: -1 });

    // Check if there are any
    if (!retrievedOtp || retrievedOtp.length == 0) {
      throw new Error("No OTP found for that email");
    }

    // Get the latest OTP
    const latestOTP: IOTP = retrievedOtp[0];

    // Check if the one retrieved already expired
    if (latestOTP.expiry.getTime() <= Date.now()) {
      throw new Error("No valid OTP was found");
    }

    // Compare the lastest OTP with the one received
    const verified = await bcrypt.compare(otp, latestOTP.otp);

    // Delete all OTPs for that email
    const deleteResult = await OTP.deleteMany({ email });
    console.log(`${deleteResult.deletedCount} otps from ${email} were deleted`);

    return verified;
    
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return null;
  }
};

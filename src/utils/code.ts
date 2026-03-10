import crypto from 'crypto';

const generateCode = () => {
    return crypto.randomBytes(32).toString('hex'); // 64-character secure random string
}

export default generateCode;
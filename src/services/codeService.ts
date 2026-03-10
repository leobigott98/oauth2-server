import Code, {ICode} from '../models/Code';

export const saveAuthorizationCode = async ({code, user_id, client_id, redirectUri, expiresAt}: ICode): Promise<ICode | null> =>{
    try {
        const newCode = new Code({ code, user_id, client_id, redirectUri, expiresAt });
        await newCode.save();
        return newCode;
    } catch (err) {
        console.error('Error saving authorization code:', err);
        throw err;
    }
}

export const findAuthorizationCode = async (code: string): Promise<ICode | null> => {
    return await Code.findOne({ code });
}

export const markCodeAsUsed = async (code:string): Promise<ICode | null> => {
    await Code.updateOne({ code }, { used: true });
    return await Code.findOne({ code });
}

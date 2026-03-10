// Email validation
export const isValidEmail = (email: string) => {
    if(typeof email === "string"){
        const regexProd = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // FOR PRODUCTION
        const regex = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/; // FOR DEVELOPMENT
        return regex.test(email);
    } else return false
};

// Name validation
export const isValidName = (name: string) => {
    if(typeof name === "string"){
        const processed = name.trim().toUpperCase();
        const regex = /^[A-ZÀ-ÿ-a-z']+(?: [A-ZÀ-ÿ-a-z']+)*$/;
        return regex.test(processed);
    }else return false
};

export const isValidPassword = (password: string) => {
    // Password must be at least 8 characters long, include a number, and a special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

export const isValidSentence = (sentence: string) => {
    if(typeof sentence === "string"){
        const processed = sentence.trim();
        const regex = /^[¡¿A-ZÀ-ÿ-a-z'!?:]+(?: [¡¿A-ZÀ-ÿ-a-z'!?]+)*$/;
        return regex.test(processed);
    }else return false
}
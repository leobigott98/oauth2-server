// Email validation
const isValidEmail = (email)=>{
    if(typeof email === "string"){
        const regexProd = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // FOR PRODUCTION
        const regex = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/; // FOR DEVELOPMENT
        return regex.test(email);
    } else return false
};

// Name validation
const isValidName = (name)=>{
    if(typeof name === "string"){
        const processed = name.trim().toUpperCase();
        const regex = /^[A-ZÀ-ÿ-a-z']+(?: [A-ZÀ-ÿ-a-z']+)*$/;
        return regex.test(processed);
    }else return false
};

const isValidPassword = (password) => {
    // Password must be at least 8 characters long, include a number, and a special character
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const isValidSentence = (sentence)=>{
    if(typeof sentence === "string"){
        const processed = sentence.trim();
        const regex = /^[¡¿A-ZÀ-ÿ-a-z'!?:]+(?: [¡¿A-ZÀ-ÿ-a-z'!?]+)*$/;
        return regex.test(processed);
    }else return false
}


module.exports = { isValidEmail, isValidName, isValidPassword, isValidSentence};
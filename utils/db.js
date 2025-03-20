const mongoose = require("mongoose");
const uri = process.env.MONGODB_CONN_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB Atlas!');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
        
    }
};

const closeDBConnection = async ()=>{
    try {
        await mongoose.connection.close();  
        console.log('Connection to MongoDB Atlas successfully closed!')
    } catch (err) {
        console.error('Closing Database connection failed:', err)
        process.exit(1);
    }
}

module.exports = { connectDB, closeDBConnection};
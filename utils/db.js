const mongoose = require("mongoose");
const uri = process.env.MONGODB_CONN_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log('MongoDB to MongoDB Atlas!');
    } catch (err) {
        console.error('Database connection failed', err);
        process.exit(1);
        
    }
};

module.exports = connectDB;
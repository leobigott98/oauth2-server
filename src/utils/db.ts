import mongoose from 'mongoose';
const uri = process.env.MONGODB_CONN_URI as string;

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB Atlas/Local!');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
};

export const closeDBConnection = async (): Promise<void> => {
    try {
        await mongoose.connection.close();  
        console.log('✅ Connection to MongoDB successfully closed!')
    } catch (err) {
        console.error('❌ Closing Database connection failed:', err)
        process.exit(1);
    }
};
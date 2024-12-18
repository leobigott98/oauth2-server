// Import dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const morgan = require('morgan');
const connectDB = require('./utils/db');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: true }));
app.use(morgan('dev'));

app.use('/oauth', (req, res, next) => {
    console.log('OAuth route middleware triggered');
    next();
});

app.use('/oauth', authRoutes);

const PORT = 4000;

// Start the server
const startServer = async () =>{
    try {
        // Connect to MongoDB
        await connectDB();

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`OAuth2 server running on http://localhost:${PORT}`);
        });
        
    } catch (err) {
        console.error('Failed to start the server', err);
        process.exit(1);
        
    }
};

startServer();





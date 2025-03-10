// Import dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const tokenRoutes = require('./routes/token');
const morgan = require('morgan');
const connectDB = require('./utils/db');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: true }));
app.use(morgan('dev'));

//public accessed files
app.use('/', express.static(path.join(__dirname, 'public')));

//index
app.use('/', require('./routes/root'));

app.use('/oauth', (req, res, next) => {
    console.log('OAuth route middleware triggered');
    next();
});

app.use('/oauth/authorize', authRoutes);
app.use('/oauth/token', tokenRoutes);

//404 for all other non-specified routes
app.all('*', (req, res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));                                                                                                                                                
    } else if (req.accepts('json')){
        res.json({message: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

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





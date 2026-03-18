// Import dependencies
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import morgan from 'morgan';
import path from 'path';

// Routes
import authRoutes from './routes/auth';
import oauthRoutes from './routes/oauth';
import userRoutes from './routes/user';
import rootRoutes from './routes/root';
import resetPasswordRoutes from './routes/reset-password';

// Databse connection
import { connectDB } from './utils/db';

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: true }));
app.use(morgan('dev'));

//public accessed files
app.use('/', express.static(path.join(process.cwd(), 'src', 'public')));

// Main routes
app.use('/', rootRoutes);
app.use('/reset-password', resetPasswordRoutes);
app.use('/auth', authRoutes);
app.use('/oauth', oauthRoutes);
app.use('/user', userRoutes);
// app.use('/token', tokenRoutes);

//404 for all other non-specified routes
app.all('*', (req: Request, res: Response)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(process.cwd(), 'src', 'views', '404.html'));                                                                                                                                               
    } else if (req.accepts('json')){
        res.json({message: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

const PORT = process.env.PORT || 4000;

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





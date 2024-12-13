const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'your_session_secret', resave: false, saveUninitialized: true }));

app.use('/oauth', authRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`OAuth2 server running on http://localhost:${PORT}`);
});



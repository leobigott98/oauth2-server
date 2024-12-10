//import dependencies
require('dotenv').config();
const express = require('express');
const helmet = require( 'helmet');
const morgan = require('morgan');
const path = require('path')
const PORT = process.env.PORT || 3500;

//set up express server
const app = express();

//Environment
console.log(process.env.NODE_ENV)

//middleware
app.use(express.json())
app.use(morgan('dev'));
app.use(helmet());

app.listen(PORT, ()=>{
    console.log(`Listening on PORT ${PORT}`)
})


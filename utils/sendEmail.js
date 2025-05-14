const nodemailer = require('nodemailer');

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASSWORD,
  },
});

// Wrap in an async IIFE so we can use await.
const sendMail = async(to, subject, html)=> {
  const info = await transporter.sendMail({
    from: 'Zelle PuntoGo <zelle@puntogove.com>',
    to, // list of receivers
    subject, // Subject line
    //text: "Hello world?", // plain‑text body
    html, // HTML body
  });

  console.log("Message sent:", info.messageId);
};

module.exports = {sendMail};
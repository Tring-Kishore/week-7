const nodemailer = require('nodemailer');
require('dotenv').config();
// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail or any other service
  auth: {
    user: process.env.EMAIL, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Function to send an email
async function sendEmail({ from, to, subject, text }) {
  console.log('the from email',from);
  const mailOptions = {
    from: from,
    to,
    subject,
    text,
  };

  try {
    console.log('Sending email with options:', mailOptions); // Log the email options
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error); // Log the full error
    throw new Error('Failed to send email');
  }
}

module.exports = { sendEmail };
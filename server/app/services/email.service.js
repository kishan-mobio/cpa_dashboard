import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { CONSTANTS } from '../utils/constants.utils.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
});

const sendEmail = async (email, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return CONSTANTS.EMAIL.SENT_SUCCESS;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(CONSTANTS.EMAIL.SEND_FAILED);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const subject = CONSTANTS.EMAIL.WELCOME_EMAIL_SUBJECT;
  const html = `
    <p>Hi ${name}!, ${subject}.</p>
    <p>We are excited to work with you. </p>
  `;

  return sendEmail(email, subject, null, html);
};

export const sendForgotPasswordEmail = async (
  email,
  url,
  resetPasswordToken
) => {
  const subject = 'Reset Password';
  const html = `
    <p>Hi there! You have requested to reset your password.</p>
    <p>Please click the button below to reset your password:</p>
    <p>Token will expire in 1h.</p>
    <a href="${url}/${resetPasswordToken}">
      <button style="background-color: #008CBA; color: white; padding: 10px 20px; border: none; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">
        Reset Password
      </button>
    </a>
  `;
  return sendEmail(email, subject, null, html);
};

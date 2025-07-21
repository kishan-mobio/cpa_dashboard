import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { CONSTANTS } from '../utils/constants.utils.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_EMAIL_PASSWORD,
  },
});

/**
 * Send email using Nodemailer
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string|null} text - Plain text content
 * @param {string} html - HTML content
 * @returns {Promise<string>} - Success message
 * @throws {Error} - If email sending fails
 */
const sendEmail = async (email, subject, text, html) => {
  try {
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
      html,
    });

    return CONSTANTS.EMAIL.SENT_SUCCESS;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(CONSTANTS.EMAIL.SEND_FAILED);
  }
};

/**
 * Send welcome email to a new user
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient name
 * @returns {Promise<string>} - Success message
 */
export const sendWelcomeEmail = async (email, name) =>
  sendEmail(
    email,
    CONSTANTS.EMAIL.WELCOME_EMAIL_SUBJECT,
    null,
    `
      <p>Hi ${name}!, welcome to our team!.</p>
      <p>We are excited to work with you.</p>
    `
  );

/**
 * Send forgot password email with reset link
 * @param {string} email - Recipient email address
 * @param {string} url - Base URL for reset link
 * @param {string} resetPasswordToken - Token for password reset
 * @returns {Promise<string>} - Success message
 */
export const sendForgotPasswordEmail = async (email, url, resetPasswordToken) =>
  sendEmail(
    email,
    'Reset Password',
    null,
    `
      <p>Hi there! You have requested to reset your password.</p>
      <p>Please click the button below to reset your password:</p>
      <p>Token will expire in 1h.</p>
      <a href="${url}/${resetPasswordToken}">
        <button style="background-color: #008CBA; color: white; padding: 10px 20px; border: none; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;">
          Reset Password
        </button>
      </a>
    `
  );

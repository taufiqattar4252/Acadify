import nodemailer from 'nodemailer';
import AppError from '../utils/AppError';
import logger from '../config/logger';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const emailUser = process.env.EMAIL_USERNAME;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (!emailUser || emailUser === 'placeholder' || !emailPass || emailPass === 'placeholder') {
      logger.debug({ 
        event: 'email.mock.sent', 
        to: options.email, 
        subject: options.subject, 
        message: options.message,
        html: options.html 
      }, 'MOCK EMAIL SENT');
      return;
    }

    const isGmail = process.env.EMAIL_HOST?.includes('gmail');
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: {
              user: emailUser,
              pass: emailPass,
            },
          }
        : {
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: parseInt(process.env.EMAIL_PORT || '2525'),
            auth: {
              user: emailUser,
              pass: emailPass,
            },
          }
    );

    const mailOptions = {
      from: `MHT-CET Platform <${emailUser}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error({ event: 'email.send.failed', err: error }, 'Error sending email');
    throw new AppError('There was an error sending the email. Try again later!', 500);
  }
};

export default sendEmail;

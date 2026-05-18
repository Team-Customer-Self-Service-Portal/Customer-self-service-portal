import nodemailer from 'nodemailer';
import { logger } from '../../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);

      logger.info(`Email sent successfully to ${options.to}`, {
        subject: options.subject
      });

    } catch (error) {
      logger.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <h1>Welcome to Customer Portal!</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for creating an account with us.</p>
      <p>You can now access our self-service portal to:</p>
      <ul>
        <li>Create and track support cases</li>
        <li>Browse our knowledge base</li>
        <li>Participate in community discussions</li>
      </ul>
      <p>Get started: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Customer Portal',
      html,
    });
  }

  async sendCaseUpdateEmail(email: string, caseNumber: string, status: string): Promise<void> {
    const html = `
      <h1>Case Update Notification</h1>
      <p>Your case ${caseNumber} has been updated.</p>
      <p><strong>New Status:</strong> ${status}</p>
      <p>View your case: <a href="${process.env.FRONTEND_URL}/cases/${caseNumber}">${process.env.FRONTEND_URL}/cases/${caseNumber}</a></p>
    `;

    await this.sendEmail({
      to: email,
      subject: `Case ${caseNumber} Updated`,
      html,
    });
  }
}

export const emailService = new EmailService();

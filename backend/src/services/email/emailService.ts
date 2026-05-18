import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { IUser } from '../../models';

interface CaseEmailData {
  caseNumber: string;
  subject: string;
  status?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templateDir = path.join(__dirname, 'templates');

const renderTemplate = (templateName: string, data: Record<string, string>): string => {
  const filePath = path.join(templateDir, templateName);
  let html = fs.readFileSync(filePath, 'utf8');
  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{{${key}}}}`, 'g'), value);
  });
  return html;
};

const send = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({ from: process.env.FROM_EMAIL, to, subject, html });
};

export const emailService = {
  async sendWelcomeEmail(user: IUser): Promise<void> {
    const html = renderTemplate('welcome.html', { firstName: user.firstName, fullName: `${user.firstName} ${user.lastName}` });
    await send(user.email, 'Welcome to Customer Self-Service Portal', html);
  },
  async sendCaseCreatedEmail(user: IUser, caseData: CaseEmailData): Promise<void> {
    const html = renderTemplate('caseCreated.html', { firstName: user.firstName, caseNumber: caseData.caseNumber, subject: caseData.subject });
    await send(user.email, `Case ${caseData.caseNumber} created`, html);
  },
  async sendCaseUpdatedEmail(user: IUser, caseData: CaseEmailData, updateMessage: string): Promise<void> {
    const html = renderTemplate('caseUpdated.html', { firstName: user.firstName, caseNumber: caseData.caseNumber, status: caseData.status || 'Updated', updateMessage });
    await send(user.email, `Case ${caseData.caseNumber} updated`, html);
  },
  async sendPasswordResetEmail(user: IUser, resetToken: string): Promise<void> {
    const html = renderTemplate('passwordReset.html', { firstName: user.firstName, resetToken });
    await send(user.email, 'Reset your password', html);
  },
};

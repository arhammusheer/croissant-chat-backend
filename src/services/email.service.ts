import sgMail from "@sendgrid/mail";
import { SG_DOMAIN, SG_MAIL } from "../config";

export class EmailService {
  email_to: string;

  constructor(email_to: string) {
    sgMail.setApiKey(SG_MAIL);

    this.email_to = email_to;
  }

  async sendForgotPasswordEmail(token: string) {
    const msg = {
      to: this.email_to,
      from: `noreply@${SG_DOMAIN}`,
      subject: "Reset your password - Croissant Chat",
      text: `Click here to reset your password: https://chat.croissant.one/reset-password/${token}`,
      html: `<p>Click here to reset your password: <a href="https://chat.croissant.one/reset-password/${token}">https://chat.croissant.one/reset-password/${token}</a></p>`,
    };

    await sgMail.send(msg);
  }

  async sendVerificationEmail(token: string) {
    const msg = {
      to: this.email_to,
      from: `noreply@${SG_DOMAIN}`,
      subject: "Verify your email - Croissant Chat",
      text: `Click here to verify your email: https://chat.croissant.one/verify-email/${token}`,
      html: `<p>Click here to verify your email: <a href="https://chat.croissant.one/verify-email/${token}">https://chat.croissant.one/verify-email/${token}</a></p>`,
    };

    await sgMail.send(msg);
  }

  async sendWelcomeEmail() {
    const msg = {
      to: this.email_to,
      from: `noreply@${SG_DOMAIN}`,
      subject: "Welcome to Croissant Chat",
      text: "Welcome to Croissant Chat!",
      html: "<p>Welcome to Croissant Chat!</p>",
    };

    await sgMail.send(msg);
  }

  async sendPasswordChangedEmail() {
    const msg = {
      to: this.email_to,
      from: `noreply@${SG_DOMAIN}`,
      subject: "Your password has been changed - Croissant Chat",
      text: "Your password has been changed",
      html: "<p>Your password has been changed</p>",
    };

    await sgMail.send(msg);
  }

  async sendAccountDeletedEmail() {
    const msg = {
      to: this.email_to,
      from: `noreply@${SG_DOMAIN}`,
      subject: "Your account has been deleted - Croissant Chat",
      text: "Your account has been deleted",
      html: "<p>Your account has been deleted</p>",
    };

    await sgMail.send(msg);
  }

  async sendLoginEmail(device: string) {
    const msg = {
      to: this.email_to,
      from: `noreply@${SG_DOMAIN}`,
      subject: "You logged in - Croissant Chat",
      text: "You logged in from " + device,
      html: "<p>You logged in from " + device + "</p>",
    };

    await sgMail.send(msg);
  }
}

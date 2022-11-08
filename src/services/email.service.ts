import sgMail from "@sendgrid/mail";
import { SG_DOMAIN, SG_MAIL } from "../config";

sgMail.setApiKey(SG_MAIL);
const FROM = `passwordless@${SG_DOMAIN}`;

export const EmailService = {
  sendPasswordlessEmail: async (email: string, link: string) => {
    const msg = {
      to: email,
      from: FROM,
      subject: "Your passwordless link",
      text: `Your passwordless link is: ${link}`,
      html: `<strong>Your passwordless link is: ${link}</strong>`,
    };

    await sgMail.send(msg);

    return;
  },
};

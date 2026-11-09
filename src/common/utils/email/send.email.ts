import nodemailer from "nodemailer";
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from "../../../config";
import { BadRequestException } from "../../exception/domain.exception";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: APP_EMAIL,
    pass: APP_PASSWORD,
  },
});

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  attachments,
}: {
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html: string;
  attachments?: any[];
}) => {
  try {
    if (!to?.length && !cc?.length && !bcc?.length) {
      throw new BadRequestException("Missing Email Recipients");
    }
    if (!subject?.length && !text?.length && !html?.length) {
      throw new BadRequestException("Missing Email Content");
    }
    const info = await transporter.sendMail({
      from: `${APP_NAME} <${APP_EMAIL}>`, // sender address
      to, // list of recipients
      cc, // list of CC recipients (mentions)
      bcc, // list of BCC recipients (mentions hidden)
      subject, // subject line
      text, // plain text body
      html, // HTML body
      attachments, // array of attachment objects
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};

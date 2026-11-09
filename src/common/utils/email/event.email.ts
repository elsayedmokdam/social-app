import { EventEmitter } from "node:events";
import { EmailSubjectEnum } from "../../enum";
import { emailTemplates } from "./tamplates.email";
import { sendEmail } from "./send.email";
export const emailEvent = new EventEmitter();

emailEvent.on(
  "sendEmail",
  async ({
    recipients,
    subject = EmailSubjectEnum.CONFIRM_EMAIL,
    data,
  }: {
    recipients: { to?: string[]; cc?: string[]; bcc?: string[] };
    subject?: EmailSubjectEnum;
    data: any;
  }) => {
    try {
      await sendEmail({
        subject,
        ...recipients,
        html: emailTemplates[subject](data),
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error sending email");
    }
  },
);

emailEvent.on("error", (error) => console.log(error));

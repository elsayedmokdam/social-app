"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../../config");
const domain_exception_1 = require("../../exception/domain.exception");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: config_1.APP_EMAIL,
        pass: config_1.APP_PASSWORD,
    },
});
const sendEmail = async ({ to, cc, bcc, subject, text, html, attachments, }) => {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) {
            throw new domain_exception_1.BadRequestException("Missing Email Recipients");
        }
        if (!subject?.length && !text?.length && !html?.length) {
            throw new domain_exception_1.BadRequestException("Missing Email Content");
        }
        const info = await transporter.sendMail({
            from: `${config_1.APP_NAME} <${config_1.APP_EMAIL}>`,
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments,
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (err) {
        console.error("Error while sending mail:", err);
        throw err;
    }
};
exports.sendEmail = sendEmail;

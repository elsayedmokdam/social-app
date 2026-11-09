"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const enum_1 = require("../../enum");
const tamplates_email_1 = require("./tamplates.email");
const send_email_1 = require("./send.email");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ recipients, subject = enum_1.EmailSubjectEnum.CONFIRM_EMAIL, data, }) => {
    try {
        await (0, send_email_1.sendEmail)({
            subject,
            ...recipients,
            html: tamplates_email_1.emailTemplates[subject](data),
        });
    }
    catch (error) {
        console.log(error);
        throw new Error("Error sending email");
    }
});
exports.emailEvent.on("error", (error) => console.log(error));

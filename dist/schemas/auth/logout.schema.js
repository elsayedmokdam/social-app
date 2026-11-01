"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutSchema = void 0;
const zod_1 = require("zod");
const validation_1 = require("../../common/validation");
const common_1 = require("../../common");
const logoutSchema = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            action: zod_1.z
                .enum(common_1.LogoutEnum, {
                message: lang === common_1.LanguageEnum.AR
                    ? "خيار غير صالح: يجب أن يكون أحد الخيارات 0|1"
                    : "Invalid option: expected one of 0|1",
            })
                .default(common_1.LogoutEnum.ONE),
        }),
        headers: validation_1.generalValidationFields.header(lang),
    });
};
exports.logoutSchema = logoutSchema;

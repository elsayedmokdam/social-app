"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("../../common");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [3, "First name must be at least 3 characters."],
        maxlength: [25, "First name must be at most 25 characters."],
    },
    lastName: {
        type: String,
        required: true,
        minlength: [3, "Last name must be at least 3 characters."],
        maxlength: [25, "Last name must be at most 25 characters."],
    },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gm,
            "Only valid email is allowed.",
        ],
    },
    password: {
        type: String,
        required: function () {
            return this.provider === common_1.ProviderEnum.SYSTEM;
        },
    },
    confirmPassword: {
        type: String,
        required: function () {
            return this.provider === common_1.ProviderEnum.SYSTEM;
        },
    },
    confirmEmail: Date,
    DOB: Date,
    phone: String,
    image: String,
    imageCover: [String],
    gender: {
        type: Number,
        enum: common_1.GenderEnum,
        default: common_1.GenderEnum.MALE,
    },
    role: {
        type: Number,
        enum: common_1.RoleEnum,
        default: common_1.RoleEnum.USER,
    },
    provider: {
        type: Number,
        enum: common_1.ProviderEnum,
        default: common_1.ProviderEnum.SYSTEM,
    },
    changeCredentialsTime: Date,
}, {
    timestamps: true,
    strict: true,
    autoIndex: true,
    validateBeforeSave: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    optimisticConcurrency: true,
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({
        firstName,
        lastName,
    });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.default.models.users || mongoose_1.default.model("users", userSchema);

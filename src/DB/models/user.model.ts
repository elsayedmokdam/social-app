import mongoose from "mongoose";
import { GenderEnum, IUser, ProviderEnum, RoleEnum } from "../../common";

const userSchema = new mongoose.Schema<IUser>(
  {
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
      required: function (): boolean {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },

    confirmPassword: {
      type: String,
      required: function (): boolean {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },

    confirmEmail: Date,

    DOB: Date,

    phone: String,

    image: String,

    imageCover: [String],

    gender: {
      type: Number,
      enum: GenderEnum,
      default: GenderEnum.MALE,
    },

    role: {
      type: Number,
      enum: RoleEnum,
      default: RoleEnum.USER,
    },

    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },

    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: true,
    validateBeforeSave: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    optimisticConcurrency: true,
  },
);

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

export const UserModel =
  mongoose.models.users || mongoose.model<IUser>("users", userSchema);

export type HUser = mongoose.HydratedDocument<IUser>;

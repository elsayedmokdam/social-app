"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = void 0;
const config_1 = require("../../../config");
const enum_1 = require("../../enum");
exports.emailTemplates = {
    [enum_1.EmailSubjectEnum.CONFIRM_EMAIL]: (data) => confirmEmailTemplate(data),
    [enum_1.EmailSubjectEnum.FORGOT_PASSWORD]: (data) => forgotPasswordTemplate(data),
    [enum_1.EmailSubjectEnum.TWO_STEP_VERIFICATION]: (data) => twoStepVerificationTemplate(data),
};
const confirmEmailTemplate = (data) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Confirm Your Email</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f7fb;
      padding: 40px 15px;
    "
  >
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background-color: #2563eb;
                padding: 30px 20px;
              "
            >
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 26px;
                font-weight: 700;
              ">
                Welcome!
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #dbeafe;
                font-size: 14px;
              ">
                We're happy to have you with us.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h2 style="
                margin: 0 0 16px;
                font-size: 24px;
                color: #111827;
                text-align: center;
              ">
                Confirm Your Email
              </h2>

              <p style="
                margin: 0 0 12px;
                font-size: 16px;
                line-height: 1.7;
                color: #4b5563;
                text-align: center;
              ">
                Thanks for creating an account with us.
              </p>

              <p style="
                margin: 0 0 25px;
                font-size: 15px;
                line-height: 1.6;
                color: #6b7280;
                text-align: center;
              ">
                Please use the verification code below to confirm your email address:
              </p>

              <!-- Email -->
              <p style="
                margin: 0 0 20px;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
              ">
                ${data.email}
              </p>

              <!-- Verification Code -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td align="center">

                    <div style="
                      display: inline-block;
                      padding: 18px 32px;
                      background-color: #eff6ff;
                      border: 1px solid #bfdbfe;
                      border-radius: 10px;
                      color: #1d4ed8;
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: 8px;
                    ">
                      ${data.code}
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Expiration -->
              <p style="
                margin: 25px 0 0;
                text-align: center;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                This verification code will expire in
                <strong style="color: #374151;">
                  ${config_1.OTP_EXPIRES_IN / 60} minutes
                </strong>.
              </p>

              <!-- Security Notice -->
              <div style="
                margin-top: 30px;
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              ">
                <p style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #6b7280;
                  text-align: center;
                ">
                  If you didn't create an account, you can safely ignore
                  this email. Never share this verification code with anyone.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 22px 20px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
              "
            >

              <p style="
                margin: 0 0 8px;
                font-size: 13px;
                color: #9ca3af;
              ">
                © 2026 Your App. All rights reserved.
              </p>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated email, please don't reply.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};
const forgotPasswordTemplate = (data) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Reset Your Password</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background-color: #f4f7fb;
      padding: 40px 15px;
    "
  >
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background-color: #2563eb;
                padding: 30px 20px;
              "
            >
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 26px;
                font-weight: 700;
              ">
                Password Reset
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #dbeafe;
                font-size: 14px;
              ">
                Secure your account
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">

              <h2 style="
                margin: 0 0 16px;
                font-size: 24px;
                color: #111827;
                text-align: center;
              ">
                Reset Your Password
              </h2>

              <p style="
                margin: 0 0 12px;
                font-size: 16px;
                line-height: 1.7;
                color: #4b5563;
                text-align: center;
              ">
                We received a request to reset the password for your account.
              </p>

              <p style="
                margin: 0 0 25px;
                font-size: 15px;
                line-height: 1.6;
                color: #6b7280;
                text-align: center;
              ">
                Use the verification code below to continue resetting your password.
              </p>

              <!-- Email -->
              <p style="
                margin: 0 0 20px;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
              ">
                ${data.email}
              </p>

              <!-- OTP Code -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td align="center">

                    <div style="
                      display: inline-block;
                      padding: 18px 32px;
                      background-color: #eff6ff;
                      border: 1px solid #bfdbfe;
                      border-radius: 10px;
                      color: #1d4ed8;
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: 8px;
                    ">
                      ${data.code}
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Expiration -->
              <p style="
                margin: 25px 0 0;
                text-align: center;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                This verification code will expire in
                <strong style="color: #374151;">
                  ${config_1.OTP_EXPIRES_IN / 60} minutes
                </strong>.
              </p>

              <!-- Security Notice -->
              <div style="
                margin-top: 30px;
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              ">
                <p style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #6b7280;
                  text-align: center;
                ">
                  If you didn't request a password reset, you can safely
                  ignore this email. Never share this verification code
                  with anyone.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 22px 20px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
              "
            >

              <p style="
                margin: 0 0 8px;
                font-size: 13px;
                color: #9ca3af;
              ">
                © 2026 Your App. All rights reserved.
              </p>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated email, please don't reply.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
};
const twoStepVerificationTemplate = (data) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Two-Step Verification</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f7fb; padding: 40px 15px;"
  >
    <tr>
      <td align="center">
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width: 600px;
            background-color: #ffffff;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          "
        >
          <!-- Header -->
          <tr>
            <td
              align="center"
              style="background-color: #2563eb; padding: 30px 20px;"
            >
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 26px;
                font-weight: 700;
              ">
                Security Verification
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #dbeafe;
                font-size: 14px;
              ">
                An extra layer of protection for your account
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">
              <h2 style="
                margin: 0 0 16px;
                font-size: 24px;
                color: #111827;
                text-align: center;
              ">
                Verify Your Identity
              </h2>

              <p style="
                margin: 0 0 12px;
                font-size: 16px;
                line-height: 1.7;
                color: #4b5563;
                text-align: center;
              ">
                A two-step verification code is required to complete
                your sign-in.
              </p>

              <p style="
                margin: 0 0 25px;
                font-size: 15px;
                line-height: 1.6;
                color: #6b7280;
                text-align: center;
              ">
                Enter the following code when prompted to verify
                your identity and securely access your account.
              </p>

              <!-- Email -->
              <p style="
                margin: 0 0 20px;
                text-align: center;
                font-size: 14px;
                color: #6b7280;
              ">
                ${data.email}
              </p>

              <!-- Verification Code -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td align="center">
                    <div style="
                      display: inline-block;
                      padding: 18px 32px;
                      background-color: #eff6ff;
                      border: 1px solid #bfdbfe;
                      border-radius: 10px;
                      color: #1d4ed8;
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: 8px;
                    ">
                      ${data.code}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Expiration -->
              <p style="
                margin: 25px 0 0;
                text-align: center;
                font-size: 14px;
                line-height: 1.6;
                color: #6b7280;
              ">
                This verification code will expire in
                <strong style="color: #374151;">
                  ${config_1.OTP_EXPIRES_IN / 60} minutes
                </strong>.
              </p>

              <!-- Security Notice -->
              <div style="
                margin-top: 30px;
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              ">
                <p style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #6b7280;
                  text-align: center;
                ">
                  If you didn't attempt to sign in, do not enter or share
                  this code. Consider securing your account because
                  someone may be trying to access it.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 22px 20px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
              "
            >
              <p style="
                margin: 0 0 8px;
                font-size: 13px;
                color: #9ca3af;
              ">
                © 2026 Your App. All rights reserved.
              </p>

              <p style="
                margin: 0;
                font-size: 12px;
                color: #9ca3af;
              ">
                This is an automated email, please don't reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

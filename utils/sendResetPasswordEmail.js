// utils/sendResetPasswordEmail.js
import sendEmail from "./sendEmail.js";

export const sendResetPasswordEmail = async (userEmail, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9f0f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; text-align: center;">
        <h2 style="color: #231942;">Reset Your Password</h2>
        <p style="color: #5e548e; font-size: 16px;">We received a request to reset your password. Click the button below to continue.</p>
        <a href="${link}" target="_blank" 
           style="display: inline-block; padding: 12px 25px; margin-top: 20px; 
                  background-color: #e0b1cb; color: white; text-decoration: none; 
                  font-weight: bold; border-radius: 6px; font-size: 16px;">
          Reset Password
        </a>
        <p style="color: #5e548e; font-size: 14px; margin-top: 20px;">
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  `;
  await sendEmail(userEmail, "🔑 Reset Your Password", html);
};

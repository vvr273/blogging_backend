// utils/sendVerificationEmail.js
import sendEmail from "./sendEmail.js";

export const sendVerificationEmail = async (userEmail, token) => {
  const link = `${process.env.CLIENT_URL}/verify/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f2eaf3; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; text-align: center;">
        <h2 style="color: #231942;">Verify Your Email</h2>
        <p style="color: #5e548e; font-size: 16px;">Hi there! Click the button below to verify your email address.</p>
        <a href="${link}" target="_blank" 
           style="display: inline-block; padding: 12px 25px; margin-top: 20px; 
                  background-color: #9f86c0; color: white; text-decoration: none; 
                  font-weight: bold; border-radius: 6px; font-size: 16px;">
          Verify Email
        </a>
        <p style="color: #5e548e; font-size: 14px; margin-top: 20px;">
          If you did not sign up, please ignore this email.
        </p>
      </div>
    </div>
  `;
  await sendEmail(userEmail, "🔒 Verify Your Email for Your Account", html);
};

import sendEmail from "./sendEmail.js";

export const sendOtpEmail = async (userEmail, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f2f6ff; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; text-align: center;">
        <h2 style="color: #1f2a44;">Verify Your Email</h2>
        <p style="color: #3a4a6b; font-size: 16px;">Use this OTP to verify your account:</p>
        <p style="font-size: 32px; letter-spacing: 6px; font-weight: 700; color: #0f172a; margin: 18px 0;">${otp}</p>
        <p style="color: #3a4a6b; font-size: 14px;">This OTP expires in 10 minutes.</p>
        <p style="color: #64748b; font-size: 13px; margin-top: 20px;">If you did not create this account, ignore this email.</p>
      </div>
    </div>
  `;

  await sendEmail(userEmail, "Your verification OTP", html);
};

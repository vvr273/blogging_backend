import sendEmail from "./sendEmail.js";

export const sendResetOtpEmail = async (userEmail, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #fff4f4; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; text-align: center;">
        <h2 style="color: #7f1d1d;">Reset Password OTP</h2>
        <p style="color: #991b1b; font-size: 16px;">Use this OTP to reset your password:</p>
        <p style="font-size: 32px; letter-spacing: 6px; font-weight: 700; color: #450a0a; margin: 18px 0;">${otp}</p>
        <p style="color: #991b1b; font-size: 14px;">This OTP expires in 10 minutes.</p>
      </div>
    </div>
  `;

  await sendEmail(userEmail, "Your password reset OTP", html);
};

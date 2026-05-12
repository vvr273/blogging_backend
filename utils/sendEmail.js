import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
const mailFrom = process.env.MAIL_FROM || smtpUser;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  requireTLS: !smtpSecure,
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

export const verifySmtpConnection = async () => {
  const safeConfig = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    hasUser: Boolean(smtpUser),
    hasPass: Boolean(smtpPass),
    mailFrom,
  };

  console.log("SMTP config loaded:", safeConfig);

  try {
    await transporter.verify();
    console.log("SMTP verify success");
  } catch (err) {
    console.error("SMTP verify failed:", {
      message: err?.message,
      code: err?.code,
      command: err?.command,
      responseCode: err?.responseCode,
      response: err?.response,
    });
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    if (!smtpUser || !smtpPass) {
      throw new Error("SMTP credentials are missing: SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS)");
    }

    await transporter.sendMail({
      from: `"Auth App" <${mailFrom}>`,
      to,
      subject,
      html: `<div>${html}</div>`, // wrap in proper HTML
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email sending error:", {
      message: err?.message,
      code: err?.code,
      command: err?.command,
      responseCode: err?.responseCode,
      response: err?.response,
    });
    throw err;
  }
};

export default sendEmail;

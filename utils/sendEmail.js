import nodemailer from "nodemailer";

const mailProvider = (process.env.MAIL_PROVIDER || "smtp").toLowerCase();
const smtpFallbackToApi = String(process.env.SMTP_FALLBACK_TO_API || "true") === "true";
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
const mailFrom = process.env.MAIL_FROM || smtpUser;
const resendApiKey = process.env.RESEND_API_KEY;

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

const sendViaResend = async (to, subject, html) => {
  if (!resendApiKey || !mailFrom) {
    throw new Error("Resend not configured: RESEND_API_KEY and MAIL_FROM are required");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [to],
      subject,
      html: `<div>${html}</div>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend request failed (${response.status}): ${details}`);
  }
};

export const verifySmtpConnection = async () => {
  const safeConfig = {
    provider: mailProvider,
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    hasUser: Boolean(smtpUser),
    hasPass: Boolean(smtpPass),
    hasResendApiKey: Boolean(resendApiKey),
    smtpFallbackToApi,
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
  if (mailProvider === "resend") {
    await sendViaResend(to, subject, html);
    console.log("Email sent via Resend to:", to);
    return;
  }

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

    const isConnectionError = err?.code === "ETIMEDOUT" || err?.code === "ECONNECTION";
    if (smtpFallbackToApi && resendApiKey && isConnectionError) {
      console.log("SMTP failed, falling back to Resend API");
      await sendViaResend(to, subject, html);
      console.log("Email sent via Resend fallback to:", to);
      return;
    }

    throw err;
  }
};

export default sendEmail;

import nodemailer from "nodemailer";


const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("SMTP credentials are missing: EMAIL_USER/EMAIL_PASS");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // MUST be App Password
      },
    });

    await transporter.sendMail({
      from: `"Auth App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `<div>${html}</div>`, // wrap in proper HTML
    });

    console.log("Email sent to:", to);
  } catch (err) {
    console.error("Email sending error:", err);
    throw err;
  }
};

export default sendEmail;

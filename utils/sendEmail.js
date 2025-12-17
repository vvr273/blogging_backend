import nodemailer from "nodemailer";


const sendEmail = async (to, subject, html) => {
  try {
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
    console.log("Email sending error:", err.message);
  }
};

export default sendEmail;

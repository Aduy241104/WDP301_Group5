import nodemailer from "nodemailer";


export const sendOtpEmail = async ({ to, code, type, ttlMinutes }) => {
  // ====== HARD-CODE CONFIG (LOCAL TEST ONLY) ======
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_USER = process.env.SMTP_USER; // lấy từ env cho tiện đổi mail
  const SMTP_PASS = process.env.SMTP_PASS; // ⚠️ chỉ dùng local test

  const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME;
  const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL;
  // ===============================================

  if (!to) {
    throw new Error("No recipient email (to) provided");
  }

  // 🔹 tạo transporter TẠI ĐÂY (lazy init)
  const mailer = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // 587 => STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subjectMap = {
    register: "OTP đăng ký tài khoản",
    login: "OTP đăng nhập",
    reset_password: "OTP đặt lại mật khẩu",
  };

  const subject = subjectMap[type] || "Mã OTP";
  const from = `"${MAIL_FROM_NAME}" <${MAIL_FROM_EMAIL}>`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h3>${subject}</h3>
      <p>Mã OTP của bạn là:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px">${code}</div>
      <p>Mã có hiệu lực trong <b>${ttlMinutes}</b> phút.</p>
      <p>Nếu không phải bạn yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `;

  await mailer.sendMail({
    from,
    to,
    subject,
    html,
  });
};

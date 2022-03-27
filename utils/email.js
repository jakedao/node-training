const nodemailer = require('nodemailer');

const sendEmail = async (opt) => {
  const { email, subject, message } = opt;
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOpts = {
    from: 'Jake Dao <jakedao1991@gmail.com>',
    to: email,
    subject,
    text: message,
    // html: ""
  };

  // 3. Send email
  await transporter.sendMail(mailOpts);
};

module.exports = { sendEmail };

const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '2525', 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    // Return null to trigger graceful dev mock logging
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  const mailTransporter = getTransporter();
  const from = process.env.EMAIL_FROM || '"PulseCare Health" <noreply@pulsecare.com>';

  if (!mailTransporter) {
    console.log(`\n================ [DEV MOCK EMAIL SENT] ================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content Preview: ${text || html.replace(/<[^>]*>?/gm, '').substring(0, 150)}...`);
    console.log(`=======================================================\n`);
    return { mock: true, messageId: `mock_${Date.now()}` };
  }

  const info = await mailTransporter.sendMail({
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]*>?/gm, ''),
    html,
  });

  return info;
};

module.exports = { sendMail };

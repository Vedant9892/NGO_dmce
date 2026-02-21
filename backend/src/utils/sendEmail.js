import nodemailer from 'nodemailer';

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SECURE } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
  }

  _transporter = nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(EMAIL_PORT || '587', 10),
    secure: EMAIL_SECURE === 'true',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  return _transporter;
}

/**
 * Send an email with an optional PDF attachment.
 * @param {Object} opts
 * @param {string}   opts.to
 * @param {string}   opts.subject
 * @param {string}   opts.html
 * @param {Buffer}   [opts.attachmentBuffer]  - PDF buffer
 * @param {string}   [opts.attachmentName]    - filename for the attachment
 */
export async function sendEmail({ to, subject, html, attachmentBuffer, attachmentName }) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'NGO Platform'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  if (attachmentBuffer && attachmentName) {
    mailOptions.attachments = [
      {
        filename: attachmentName,
        content: attachmentBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  return transporter.sendMail(mailOptions);
}

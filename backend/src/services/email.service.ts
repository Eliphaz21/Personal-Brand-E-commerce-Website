import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Create a reusable transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587', 10),
  secure: env.SMTP_PORT === '465', // true for 465, false for other ports (like 587)
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup (in development)
if (env.NODE_ENV === 'development' && env.SMTP_HOST) {
  transporter.verify((error) => {
    if (error) {
      console.error('❌ SMTP Connection Error:', error.message);
    } else {
      console.log('📧 SMTP Transporter connected successfully and ready.');
    }
  });
}

/**
 * Base email layout to maintain rich, premium aesthetics in HTML emails.
 */
const getHtmlLayout = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f7eecf; /* morning-brown light fill */
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7eecf;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(74, 44, 42, 0.08); /* brown-coffee shadow */
      border: 1px solid rgba(201, 159, 153, 0.2); /* aged-pink border */
    }
    .header {
      background-color: #4a2c2a; /* brown-coffee */
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: #f2efe1; /* coconut-butter */
      margin: 0;
      font-size: 24px;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .body {
      padding: 40px 30px;
      color: #4a2c2a;
      line-height: 1.6;
    }
    .body h2 {
      font-size: 20px;
      margin-top: 0;
      color: #4a2c2a;
    }
    .otp-code {
      display: inline-block;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #c99f99; /* aged-pink primary */
      background-color: #f2efe1; /* coconut-butter background */
      padding: 15px 30px;
      border-radius: 8px;
      margin: 25px 0;
      border: 1px dashed #a5975b; /* faded-khaki */
      text-align: center;
    }
    .footer {
      background-color: #f2efe1;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #a5975b; /* faded-khaki */
      border-top: 1px solid rgba(201, 159, 153, 0.1);
    }
    .footer a {
      color: #c99f99;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>KidEnDu</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>This email was sent to you as part of your request on KidEnDu.</p>
        <p>&copy; ${new Date().getFullYear()} KidEnDu. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send an OTP code to verify new user registration.
 */
export const sendOTPEmail = async (email: string, name: string, otp: string): Promise<void> => {
  const content = `
    <h2>Welcome to KidEnDu, ${name}!</h2>
    <p>Thank you for registering. To complete your sign-up, please verify your email address using the one-time verification code below:</p>
    <div style="text-align: center;">
      <span class="otp-code">${otp}</span>
    </div>
    <p>This OTP is valid for <strong>10 minutes</strong>. If you did not register for a KidEnDu account, please ignore this email or contact support.</p>
    <br>
    <p>Warm regards,<br>The KidEnDu Team</p>
  `;

  await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'KidEnDu'}" <${env.EMAIL_FROM}>`,
    to: email,
    subject: '🌿 Verify your KidEnDu email address',
    html: getHtmlLayout(content),
  });
};

/**
 * Send an OTP code for resetting a forgotten password.
 */
export const sendPasswordResetEmail = async (email: string, name: string, otp: string): Promise<void> => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your KidEnDu account. Use the one-time code below to complete the reset process:</p>
    <div style="text-align: center;">
      <span class="otp-code">${otp}</span>
    </div>
    <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please secure your account immediately and ignore this email.</p>
    <br>
    <p>Warm regards,<br>The KidEnDu Team</p>
  `;

  await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'KidEnDu'}" <${env.EMAIL_FROM}>`,
    to: email,
    subject: '🔒 Reset your KidEnDu password',
    html: getHtmlLayout(content),
  });
};

/**
 * Send a reply to a user's contact message.
 */
export const sendContactReplyEmail = async (
  email: string,
  name: string,
  subject: string,
  replyBody: string,
  originalMessage: string
): Promise<void> => {
  const content = `
    <h2>Response to your message: "${subject}"</h2>
    <p>Hello ${name},</p>
    <p>Thank you for reaching out to us. An admin has reviewed your message and provided the following response:</p>
    <div style="background-color: rgba(201, 159, 153, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c99f99;">
      <p style="margin: 0; white-space: pre-wrap;">${replyBody}</p>
    </div>
    
    <p style="font-size: 14px; color: #a5975b; margin-top: 30px;"><strong>Your Original Message:</strong></p>
    <div style="background-color: #f2efe1; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border: 1px dashed #a5975b;">
      <p style="margin: 0; white-space: pre-wrap;">${originalMessage}</p>
    </div>
    
    <p>If you have any further questions, feel free to reply directly to this email or submit a new message through our contact form.</p>
    <br>
    <p>Warm regards,<br>The KidEnDu Team</p>
  `;

  await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'KidEnDu'}" <${env.EMAIL_FROM}>`,
    to: email,
    subject: `Re: ${subject}`,
    html: getHtmlLayout(content),
  });
};

/**
 * Welcome email after newsletter subscription.
 */
export const sendNewsletterWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const content = `
    <h2>Welcome to the KidEnDu Wellness Digest!</h2>
    <p>Hello ${name},</p>
    <p>Thank you for subscribing to Coach Kidist's weekly wellness updates. You'll receive fertility tips, egg quality nutrition guides, recipes, and exclusive discount codes.</p>
    <p>You can also send a personal message directly to Coach Kidist from our website after subscribing — replies will arrive in this inbox.</p>
    <br>
    <p>Warm regards,<br>Coach Kidist & The KidEnDu Team</p>
  `;

  await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'KidEnDu'}" <${env.EMAIL_FROM}>`,
    to: email,
    subject: '🌿 Welcome to the KidEnDu Hormone Blueprint Digest',
    html: getHtmlLayout(content),
  });
};

/**
 * Confirmation email when a subscriber sends a message to admin.
 */
export const sendNewsletterMessageConfirmationEmail = async (
  email: string,
  name: string,
  subject: string
): Promise<void> => {
  const content = `
    <h2>We received your message</h2>
    <p>Hello ${name},</p>
    <p>Your message "<strong>${subject}</strong>" was delivered to Coach Kidist. You'll receive a reply at this email address once it's reviewed.</p>
    <br>
    <p>Warm regards,<br>The KidEnDu Team</p>
  `;

  await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'KidEnDu'}" <${env.EMAIL_FROM}>`,
    to: email,
    subject: '✓ Your message to Coach Kidist was received',
    html: getHtmlLayout(content),
  });
};

/**
 * Broadcast email sent by admin to all newsletter subscribers.
 */
export const sendNewsletterBroadcastEmail = async (
  email: string,
  name: string,
  subject: string,
  body: string
): Promise<void> => {
  const content = `
    <h2>${subject}</h2>
    <p>Hello ${name},</p>
    <div style="background-color: rgba(201, 159, 153, 0.08); padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c99f99;">
      <p style="margin: 0; white-space: pre-wrap;">${body}</p>
    </div>
    <p style="font-size: 14px; color: #a5975b;">You are receiving this because you subscribed to the KidEnDu wellness digest.</p>
    <br>
    <p>Warm regards,<br>Coach Kidist & The KidEnDu Team</p>
  `;

  await transporter.sendMail({
    from: `"${env.EMAIL_FROM_NAME || 'KidEnDu'}" <${env.EMAIL_FROM}>`,
    to: email,
    subject,
    html: getHtmlLayout(content),
  });
};

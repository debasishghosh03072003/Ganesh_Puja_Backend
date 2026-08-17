import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Ensure .env.local variables are loaded
try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envConfig = fs.readFileSync(envLocalPath, 'utf-8');
    envConfig.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...val] = trimmed.split('=');
      if (key && val.length > 0) {
        process.env[key.trim()] = val.join('=').trim();
      }
    });
  }
} catch (_) {}

interface SendCredentialsOptions {
  name: string;
  email: string;
  mobile: string;
  password: string;
}

export async function sendMemberCredentialsEmail({
  name,
  email,
  mobile,
  password,
}: SendCredentialsOptions): Promise<boolean> {
  try {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const fromAddress = process.env.EMAIL_FROM || `"Shree Ganesh Puja Committee" <${smtpUser || 'noreply@ganeshpuja.org'}>`;

    let transporter: nodemailer.Transporter;

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Fallback for local testing if SMTP credentials are not yet set in .env.local
      console.warn(
        '⚠️ SMTP credentials not found in environment variables (SMTP_USER / SMTP_PASS). Creating Ethereal test mail account...'
      );
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Shree Ganesh Puja Committee</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8F9FA; margin: 0; padding: 20px; color: #1E293B; }
        .container { max-width: 580px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #E2E8F0; }
        .header { background: linear-gradient(135deg, #4A0A1A 0%, #6B182B 50%, #380613 100%); padding: 30px 20px; text-align: center; color: #FFFFFF; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
        .header p { margin: 5px 0 0 0; color: #FFC107; font-size: 13px; font-weight: bold; }
        .content { padding: 28px 24px; }
        .welcome-title { font-size: 18px; font-weight: bold; color: #6B182B; margin-bottom: 12px; }
        .credentials-box { background: #FFF8E1; border: 1.5px dashed #FFC107; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .credential-item { font-size: 14px; margin-bottom: 10px; }
        .credential-item:last-child { margin-bottom: 0; }
        .label { font-weight: bold; color: #475569; display: inline-block; width: 110px; }
        .value { font-weight: bold; color: #6B182B; font-family: monospace; font-size: 15px; }
        .footer { background: #F1F5F9; padding: 16px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Modak App</h1>
          <p>••• Shree Ganesh Puja 2026 •••</p>
        </div>
        <div class="content">
          <div class="welcome-title">Namaste ${name},</div>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            You have been added as an official member of <strong>Shree Ganesh Puja Committee</strong>.
            You can now log in to the <strong>Modak Mobile App</strong> using your credentials below:
          </p>

          <div class="credentials-box">
            <div class="credential-item">
              <span class="label">Email / ID:</span>
              <span class="value">${email}</span>
            </div>
            <div class="credential-item">
              <span class="label">Mobile:</span>
              <span class="value">${mobile}</span>
            </div>
            <div class="credential-item">
              <span class="label">Password:</span>
              <span class="value">${password}</span>
            </div>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #64748B;">
            <strong>Login Instructions:</strong><br>
            1. Open the <strong>Modak</strong> Flutter App on your mobile device.<br>
            2. Enter your Email or Mobile number along with the Password above.<br>
            3. Tap <strong>LOGIN TO ACCOUNT</strong> to access committee contributions and expenses.
          </p>
        </div>
        <div class="footer">
          Shree Ganesh Puja Committee • Transparency & Unity
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Welcome to Shree Ganesh Puja 2026 - Your App Login Credentials`,
      text: `Namaste ${name},\n\nYou have been added to Shree Ganesh Puja Committee.\n\nYour Login Credentials:\nEmail: ${email}\nMobile: ${mobile}\nPassword: ${password}\n\nPlease open the Modak app and log in using these credentials.`,
      html: htmlContent,
    });

    console.log(`📧 Credentials Email sent to ${email}. Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error: any) {
    console.error(`❌ Error sending welcome email to ${email}:`, error.message || error);
    return false;
  }
}

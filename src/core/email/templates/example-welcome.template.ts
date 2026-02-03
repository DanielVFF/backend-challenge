import {
  EmailTemplate,
  EmailTemplateData,
} from '../interfaces/email-template.interface';

/**
 * Code confirmation email template for first login
 * This email is sent when a user logs in for the first time
 */
export class WelcomeEmailTemplate implements EmailTemplate {
  getSubject(data?: EmailTemplateData): string {
    const name = data?.name || 'User';
    return `Your Cinema Login Code - ${data?.code || ''}`;
  }

  getHtml(data?: EmailTemplateData): string {
    const name = data?.name || 'User';
    const code = data?.code || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .code-container {
              text-align: center;
              margin: 30px 0;
            }
            .code {
              display: inline-block;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              padding: 20px 40px;
              background-color: #fff;
              border: 2px dashed #4CAF50;
              border-radius: 8px;
              color: #4CAF50;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Cinema Login Confirmation</h1>
            </div>
            <div class="content">
              <h2>Hello, ${name}!</h2>
              <p>You've requested to log in to your Cinema account. Please use the following code to complete your login:</p>
              <div class="code-container">
                <div class="code">${code}</div>
              </div>
              <div class="warning">
                <strong>Important:</strong> This code will expire in 10 minutes. Do not share this code with anyone.
              </div>
              <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Cinema API. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getText(data?: EmailTemplateData): string {
    const name = data?.name || 'User';
    const code = data?.code || '';

    return `
Cinema Login Confirmation

Hello, ${name}!

You've requested to log in to your Cinema account. Please use the following code to complete your login:

${code}

Important: This code will expire in 10 minutes. Do not share this code with anyone.

If you didn't request this code, please ignore this email or contact our support team if you have concerns.

© ${new Date().getFullYear()} Cinema API. All rights reserved.
    `.trim();
  }
}

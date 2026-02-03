import {
  EmailTemplate,
  EmailTemplateData,
} from '../interfaces/email-template.interface';

export class ResetPasswordEmailTemplate implements EmailTemplate {
  getSubject(data?: EmailTemplateData): string {
    const appName = data?.appName || '';
    const code = data?.code || '';
    return `${appName} - Código de Redefinição de Senha - ${code}`;
  }

  getHtml(data?: EmailTemplateData): string {
    const name = data?.name || '';
    const code = data?.code || '';
    const appName = data?.appName || '';

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
              background-color: #FF6B35;
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
              border: 2px dashed #FF6B35;
              border-radius: 8px;
              color: #FF6B35;
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
              <h1>Redefinição de Senha</h1>
            </div>
            <div class="content">
              <h2>Olá, ${name}!</h2>
              <p>Você solicitou a redefinição de senha da sua conta ${appName}. Use o código abaixo para continuar:</p>
              <div class="code-container">
                <div class="code">${code}</div>
              </div>
              <div class="warning">
                <strong>Importante:</strong> Este código expira em 10 minutos. Não compartilhe este código com ninguém.
              </div>
              <p>Se você não solicitou a redefinição de senha, ignore este email ou entre em contato com nossa equipe de suporte se tiver preocupações.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getText(data?: EmailTemplateData): string {
    const name = data?.name || '';
    const code = data?.code || '';
    const appName = data?.appName || '';

    return `
Redefinição de Senha - ${appName}

Olá, ${name}!

Você solicitou a redefinição de senha da sua conta ${appName}. Use o código abaixo para continuar:

${code}

Importante: Este código expira em 10 minutos. Não compartilhe este código com ninguém.

Se você não solicitou a redefinição de senha, ignore este email ou entre em contato com nossa equipe de suporte se tiver preocupações.

© ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
    `.trim();
  }
}

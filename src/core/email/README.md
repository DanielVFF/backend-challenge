# Email Module

This module provides email sending functionality with automatic database logging.

## Features

- ✅ Send emails using templates
- ✅ Automatic database logging (email type, recipient, requester IP, user agent, status)
- ✅ Template-based email system
- ✅ Support for HTML and plain text emails
- ✅ Error handling and status tracking

## Setup

### Environment Variables

Add the following environment variables to your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Cinema API
```

### Database Migration

After adding the EmailLog model to Prisma schema, run:

```bash
pnpm prisma:migrate:dev
pnpm prisma:generate
```

## Usage

### 1. Create an Email Template

Create a class that implements the `EmailTemplate` interface:

```typescript
import { EmailTemplate, EmailTemplateData } from './interfaces/email-template.interface';

export class WelcomeEmailTemplate implements EmailTemplate {
  getSubject(data?: EmailTemplateData): string {
    return `Welcome, ${data?.name || 'User'}!`;
  }

  getHtml(data?: EmailTemplateData): string {
    return `
      <html>
        <body>
          <h1>Welcome, ${data?.name || 'User'}!</h1>
          <p>Thank you for joining us.</p>
        </body>
      </html>
    `;
  }

  getText(data?: EmailTemplateData): string {
    return `Welcome, ${data?.name || 'User'}!\n\nThank you for joining us.`;
  }
}
```

### 2. Send an Email

Inject `EmailService` into your service or controller:

```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from '../core/email/email.service';
import { WelcomeEmailTemplate } from '../core/email/templates/example-welcome.template';
import { Request } from 'express';

@Injectable()
export class MyService {
  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(userEmail: string, userName: string, request: Request) {
    const template = new WelcomeEmailTemplate();
    
    await this.emailService.sendEmail({
      template,
      to: userEmail,
      emailType: 'welcome',
      templateData: {
        name: userName,
        verificationLink: 'https://example.com/verify',
      },
      request, // Optional: for IP and user agent logging
    });
  }
}
```

### 3. Without Request Object (Optional)

If you don't have access to the request object, you can still send emails:

```typescript
await this.emailService.sendEmail({
  template: new WelcomeEmailTemplate(),
  to: 'user@example.com',
  emailType: 'welcome',
  templateData: {
    name: 'John Doe',
  },
  // request is optional
});
```

## Email Logging

Every email sent is automatically logged to the database with:

- `email_type`: The type identifier you provide (e.g., 'welcome', 'password-reset')
- `recipient`: The recipient email address
- `subject`: The email subject
- `requester_ip`: IP address extracted from request (if provided)
- `user_agent`: User agent from request headers (if provided)
- `status`: PENDING → SENT or FAILED
- `error_message`: Error message if sending failed
- `sent_at`: Timestamp when email was successfully sent
- `created_at`: Timestamp when the log entry was created

## Querying Email Logs

You can query email logs using the `EmailRepository`:

```typescript
import { EmailRepository } from '../core/email/email.repository';

@Injectable()
export class MyService {
  constructor(private readonly emailRepository: EmailRepository) {}

  async getEmailLogs() {
    return await this.emailRepository.getEmailLogs({
      email_type: 'welcome',
      status: 'SENT',
    });
  }
}
```

## Example Templates

See `templates/example-welcome.template.ts` for a complete example template.








import { Request } from 'express';
import { EmailTemplate } from './email-template.interface';

/**
 * Options for sending an email
 */
export interface SendEmailOptions {
  /**
   * Email template to use
   */
  template: EmailTemplate;

  /**
   * Recipient email address
   */
  to: string;

  /**
   * Template data to populate the email template
   */
  templateData?: Record<string, any>;

  /**
   * Optional subject override
   */
  subject?: string;

  /**
   * Request object to extract IP address and user agent
   */
  request?: Request;
}

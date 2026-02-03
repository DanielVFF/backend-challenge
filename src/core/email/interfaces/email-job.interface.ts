export interface EmailJobData {
  template: {
    name: string;
    data: Record<string, any>;
  };
  to: string;
  templateData?: Record<string, any>;
  subject?: string;
  request?: {
    ip?: string;
    userAgent?: string;
  };
}

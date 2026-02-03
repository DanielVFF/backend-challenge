export interface EmailTemplateData {
  [key: string]: any;
}

export interface EmailTemplate {
  getSubject(data?: EmailTemplateData): string;

  getHtml(data?: EmailTemplateData): string;

  getText?(data?: EmailTemplateData): string;
}

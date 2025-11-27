// Lightweight stub for AWS SES operations to avoid requiring @aws-sdk/client-ses at build time.
export interface EmailParams {
  to: string | string[];
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export async function sendEmail(params: EmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  console.warn("sendEmail: AWS SES client not available in this environment. Email not sent.");
  return {
    success: false,
    error: "AWS SES not configured",
  };
}

export async function sendBulkEmails(emails: EmailParams[]): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const errors: string[] = emails.map((_, i) => `Email ${i + 1}: AWS SES not configured`);
  return {
    success: false,
    sent: 0,
    failed: emails.length,
    errors,
  };
}
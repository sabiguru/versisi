/**
 * Email Sending Service
 *
 * Using Resend for email delivery
 * Add RESEND_API_KEY to your .env file
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  const from = process.env.EMAIL_FROM || "Versisi <noreply@versisi.com>";

  // DEVELOPMENT MODE: Log email to console
  if (process.env.NODE_ENV !== "production" || !resend) {
    console.log("\n📧 Email would be sent:");
    console.log("From:", from);
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("---");
    console.log(options.text);
    console.log("---\n");
    return { success: true, id: "dev-email-" + Date.now() };
  }

  // PRODUCTION MODE: Send via Resend
  try {
    const data = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { success: true, id: data.id };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Send multiple emails in batch
 */
export async function sendBatchEmails(emails: EmailOptions[]) {
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return { succeeded, failed, total: emails.length };
}

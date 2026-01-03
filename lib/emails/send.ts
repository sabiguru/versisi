/**
 * Email Sending Service
 *
 * To enable email sending:
 * 1. Choose an email service (Resend, SendGrid, Postmark, AWS SES)
 * 2. Install the package: npm install resend
 * 3. Add API key to .env: EMAIL_API_KEY=your_key
 * 4. Uncomment the code below and update the service configuration
 */

// Example with Resend (recommended for Next.js):
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}

/**
 * Send an email
 *
 * Current implementation: Logs to console (development mode)
 * Production: Uncomment email service code below
 */
export async function sendEmail(options: EmailOptions) {
  const from = process.env.EMAIL_FROM || "noreply@sygnoff.com";

  // DEVELOPMENT MODE: Log email to console
  if (process.env.NODE_ENV !== "production") {
    console.log("\n📧 Email would be sent:");
    console.log("From:", from);
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("---");
    console.log(options.text);
    console.log("---\n");
    return { success: true, id: "dev-email-" + Date.now() };
  }

  // PRODUCTION MODE: Uncomment to enable email sending
  /*
  try {
    // Example with Resend:
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
  */

  // For now, just log in production too
  console.warn("Email sending not configured. Email would be sent to:", options.to);
  return { success: false, id: null };
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

/**
 * OTP Email Template
 */

export function otpEmail(params: { email: string; token: string; isSignup: boolean }) {
  const action = params.isSignup ? "sign up for" : "sign in to";

  const subject = `Your Versisi verification code: ${params.token}`;

  const text = `
Your Versisi Verification Code

${params.token}

You requested to ${action} Versisi. Enter this code to continue.

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

---
Versisi - Scope agreements that everyone signs
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                Your Verification Code
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #6b7280;">
                You requested to ${action} Versisi. Enter this code to continue:
              </p>
            </td>
          </tr>

          <!-- OTP Code -->
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #f3f4f6; border-radius: 8px; padding: 24px;">
                    <div style="font-size: 36px; font-weight: 700; color: #111827; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${params.token}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 20px; color: #6b7280;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; line-height: 16px; color: #9ca3af; text-align: center;">
                Versisi - Scope agreements that everyone signs
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, text, html };
}

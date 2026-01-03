/**
 * Email Templates
 *
 * These are placeholder templates. To enable email sending:
 * 1. Install email service: npm install resend (or sendgrid, postmark, etc.)
 * 2. Add API key to .env: EMAIL_API_KEY=your_key
 * 3. Uncomment the email sending code in send.ts
 * 4. Customize these templates for your brand
 */

export interface ProjectInviteEmailData {
  projectName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
  expiresIn: string;
}

export function projectInviteEmail(data: ProjectInviteEmailData) {
  return {
    subject: `You've been invited to ${data.projectName}`,
    text: `
${data.inviterName} has invited you to join "${data.projectName}" as a ${data.role}.

Click the link below to accept the invitation:
${data.acceptUrl}

This invitation expires in ${data.expiresIn}.

---
Versisi - Scope Agreement Platform
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Project Invitation</h1>
    </div>
    <div class="content">
      <p><strong>${data.inviterName}</strong> has invited you to join:</p>
      <h2>"${data.projectName}"</h2>
      <p>Role: <strong>${data.role}</strong></p>
      <a href="${data.acceptUrl}" class="button">Accept Invitation</a>
      <p class="footer">This invitation expires in ${data.expiresIn}.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

export interface ApprovalRequestEmailData {
  projectName: string;
  proposalTitle: string;
  proposalVersion: string;
  changeNote: string;
  approveUrl: string;
  expiresIn: string;
}

export function approvalRequestEmail(data: ApprovalRequestEmailData) {
  return {
    subject: `Approval Required: ${data.proposalTitle}`,
    text: `
A new scope change requires your approval:

Project: ${data.projectName}
Proposal: ${data.proposalTitle} (${data.proposalVersion})
Summary: ${data.changeNote}

Review and sign the agreement:
${data.approveUrl}

This approval request expires in ${data.expiresIn}.

---
Versisi - Scope Agreement Platform
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Approval Required</h1>
    </div>
    <div class="content">
      <p><strong>Project:</strong> ${data.projectName}</p>
      <p><strong>Proposal:</strong> ${data.proposalTitle}</p>
      <p><span class="badge">${data.proposalVersion}</span></p>
      <p><strong>Summary:</strong> ${data.changeNote}</p>
      <a href="${data.approveUrl}" class="button">Review & Sign Agreement</a>
      <p style="color: #dc2626; font-size: 14px;">This request expires in ${data.expiresIn}.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

export interface ApprovalReminderEmailData {
  projectName: string;
  proposalTitle: string;
  approveUrl: string;
  expiresIn: string;
}

export function approvalReminderEmail(data: ApprovalReminderEmailData) {
  return {
    subject: `Reminder: Approval Pending - ${data.proposalTitle}`,
    text: `
This is a reminder that the following scope change is waiting for your approval:

Project: ${data.projectName}
Proposal: ${data.proposalTitle}

Please review and sign:
${data.approveUrl}

Expires in ${data.expiresIn}.

---
Versisi - Scope Agreement Platform
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fffbeb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Approval Reminder</h1>
    </div>
    <div class="content">
      <p>This is a reminder that the following proposal is waiting for your approval:</p>
      <p><strong>Project:</strong> ${data.projectName}</p>
      <p><strong>Proposal:</strong> ${data.proposalTitle}</p>
      <a href="${data.approveUrl}" class="button">Review & Sign</a>
      <p style="color: #dc2626;">Expires in ${data.expiresIn}.</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

export interface ApprovalSignedEmailData {
  projectName: string;
  proposalTitle: string;
  signerName: string;
  signerParty: string;
  remainingSignatures: number;
}

export function approvalSignedEmail(data: ApprovalSignedEmailData) {
  return {
    subject: `Agreement Signed: ${data.proposalTitle}`,
    text: `
${data.signerName} (${data.signerParty}) has signed the scope agreement:

Project: ${data.projectName}
Proposal: ${data.proposalTitle}

${data.remainingSignatures === 0 ? "All signatures collected! The proposal is now approved." : `Waiting for ${data.remainingSignatures} more signature(s).`}

---
Versisi - Scope Agreement Platform
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Agreement Signed</h1>
    </div>
    <div class="content">
      <p><strong>${data.signerName}</strong> (${data.signerParty}) has signed the agreement:</p>
      <p><strong>Project:</strong> ${data.projectName}</p>
      <p><strong>Proposal:</strong> ${data.proposalTitle}</p>
      ${data.remainingSignatures === 0 ? '<p style="color: #10b981; font-weight: bold;">🎉 All signatures collected! The proposal is now approved.</p>' : `<p>Waiting for ${data.remainingSignatures} more signature(s).</p>`}
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

export interface ApprovalDeclinedEmailData {
  projectName: string;
  proposalTitle: string;
  declinerName: string;
  declinerParty: string;
  reason: string;
}

export function approvalDeclinedEmail(data: ApprovalDeclinedEmailData) {
  return {
    subject: `Agreement Declined: ${data.proposalTitle}`,
    text: `
${data.declinerName} (${data.declinerParty}) has declined the scope agreement:

Project: ${data.projectName}
Proposal: ${data.proposalTitle}

Reason: ${data.reason}

---
Versisi - Scope Agreement Platform
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✗ Agreement Declined</h1>
    </div>
    <div class="content">
      <p><strong>${data.declinerName}</strong> (${data.declinerParty}) has declined the agreement:</p>
      <p><strong>Project:</strong> ${data.projectName}</p>
      <p><strong>Proposal:</strong> ${data.proposalTitle}</p>
      <p><strong>Reason:</strong></p>
      <blockquote style="border-left: 4px solid #dc2626; padding-left: 16px; margin: 16px 0;">${data.reason}</blockquote>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

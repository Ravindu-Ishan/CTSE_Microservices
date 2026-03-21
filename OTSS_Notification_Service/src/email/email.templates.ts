// ============================================================
// Email templates for OTSS notifications.
// Plain but professional HTML — works across all email clients.
// ============================================================

const base = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body        { margin: 0; padding: 0; background: #f4f4f4; font-family: Arial, sans-serif; }
    .wrapper    { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header     { background: #1a73e8; padding: 24px 32px; }
    .header h1  { margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; }
    .body       { padding: 32px; color: #333333; font-size: 15px; line-height: 1.6; }
    .body p     { margin: 0 0 16px; }
    .btn        { display: inline-block; margin: 8px 0 24px; padding: 12px 24px; background: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 15px; font-weight: 600; }
    .info-box   { background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 16px; margin: 16px 0; border-radius: 0 4px 4px 0; }
    .info-box p { margin: 4px 0; font-size: 14px; color: #555; }
    .info-box strong { color: #333; }
    .footer     { padding: 20px 32px; background: #f8f9fa; border-top: 1px solid #e8e8e8; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>OTSS Support</h1></div>
    <div class="body">${content}</div>
    <div class="footer">This is an automated message from the Online Ticketing Support System. Please do not reply to this email.</div>
  </div>
</body>
</html>
`;

// ----------------------------------------------------------------
// 1. Ticket Created — sent to the user who opened the ticket
// ----------------------------------------------------------------
export const ticketCreatedTemplate = (params: {
  ticketId:    string;
  title:       string;
  category:    string;
  priority:    string;
  trackingUrl: string;
}): { subject: string; html: string } => ({
  subject: `[OTSS] Ticket #${params.ticketId.slice(0, 8).toUpperCase()} — We received your request`,
  html: base(`
    <p>Hi,</p>
    <p>Thank you for contacting support. We have received your request and a member of our team will be in touch shortly.</p>

    <div class="info-box">
      <p><strong>Ticket ID:</strong> ${params.ticketId.slice(0, 8).toUpperCase()}</p>
      <p><strong>Title:</strong> ${params.title}</p>
      <p><strong>Category:</strong> ${params.category}</p>
      <p><strong>Priority:</strong> ${params.priority}</p>
    </div>

    <p>You can track the status of your ticket at any time using the link below:</p>
    <a class="btn" href="${params.trackingUrl}">Track Your Ticket</a>

    <p>We will notify you by email when there is an update on your request.</p>
    <p>Thank you for your patience.</p>
  `),
});

// ----------------------------------------------------------------
// 2. Ticket Reply — sent to the user when staff posts a message
// ----------------------------------------------------------------
export const ticketReplyTemplate = (params: {
  ticketId:    string;
  title:       string;
  message:     string;
  trackingUrl: string;
}): { subject: string; html: string } => ({
  subject: `[OTSS] New reply on Ticket #${params.ticketId.slice(0, 8).toUpperCase()} — ${params.title}`,
  html: base(`
    <p>Hi,</p>
    <p>A support agent has replied to your ticket.</p>

    <div class="info-box">
      <p><strong>Ticket:</strong> ${params.title}</p>
      <p><strong>Ticket ID:</strong> ${params.ticketId.slice(0, 8).toUpperCase()}</p>
    </div>

    <p><strong>Message from support:</strong></p>
    <div class="info-box">
      <p>${params.message}</p>
    </div>

    <p>To reply or view the full conversation, visit your ticket:</p>
    <a class="btn" href="${params.trackingUrl}">View Ticket</a>
  `),
});

// ----------------------------------------------------------------
// 3. Ticket Closed — sent to the user when ticket is resolved
// ----------------------------------------------------------------
export const ticketClosedTemplate = (params: {
  ticketId:    string;
  title:       string;
  trackingUrl: string;
}): { subject: string; html: string } => ({
  subject: `[OTSS] Ticket #${params.ticketId.slice(0, 8).toUpperCase()} has been closed`,
  html: base(`
    <p>Hi,</p>
    <p>Your support ticket has been resolved and closed.</p>

    <div class="info-box">
      <p><strong>Ticket ID:</strong> ${params.ticketId.slice(0, 8).toUpperCase()}</p>
      <p><strong>Title:</strong> ${params.title}</p>
      <p><strong>Status:</strong> Closed</p>
    </div>

    <p>We hope your issue has been fully resolved. If you still need assistance, you are welcome to open a new ticket at any time.</p>
    <a class="btn" href="${params.trackingUrl}">View Ticket</a>

    <p>Thank you for using OTSS Support.</p>
  `),
});

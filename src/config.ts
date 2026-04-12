import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "email-send",
  slug: "email-send",
  description: "Send emails programmatically. Validates format and delivers via Resend API.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/send",
      price: "$0.003",
      description: "Send an email message",
      toolName: "email_send_message",
      toolDescription: "Use this when you need to send an email to one or more recipients. Accepts to, from, subject, and body (text or HTML). Returns delivery status, message ID, and timestamp. Do NOT use for email validation — use email_verify_address instead. Do NOT use for finding email addresses — use email_find_by_name instead. Do NOT use for person data enrichment — use person_enrich_from_email instead.",
      inputSchema: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address" },
          from: { type: "string", description: "Sender email address (default: noreply@x402.dev)" },
          subject: { type: "string", description: "Email subject line" },
          body: { type: "string", description: "Email body content (plain text)" },
          html: { type: "string", description: "Email body content (HTML, optional — overrides body)" },
        },
        required: ["to", "subject", "body"],
      },
    },
  ],
};

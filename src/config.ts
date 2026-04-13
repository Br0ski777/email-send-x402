import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "email-send",
  slug: "email-send",
  description: "Send emails programmatically via Resend -- text or HTML body, delivery status, message ID. Transactional email.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/send",
      price: "$0.003",
      description: "Send an email message",
      toolName: "email_send_message",
      toolDescription: `Use this when you need to send an email to one or more recipients. Returns delivery confirmation in JSON.

Returns: 1. messageId (unique identifier) 2. status (sent/queued/failed) 3. timestamp (ISO 8601) 4. to and from addresses 5. subject.

Example output: {"messageId":"msg_01abc123","status":"sent","timestamp":"2026-04-13T14:30:00Z","to":"user@example.com","from":"noreply@x402.dev","subject":"Your Report"}

Use this FOR sending transactional emails, notifications, alerts, password resets, order confirmations, and automated reports.

Do NOT use for email validation -- use email_verify_address instead. Do NOT use for finding email addresses -- use email_find_by_name instead. Do NOT use for person data enrichment -- use person_enrich_from_email instead.`,
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
      outputSchema: {
          "type": "object",
          "properties": {
            "messageId": {
              "type": "string",
              "description": "Email message ID"
            },
            "status": {
              "type": "string",
              "description": "Send status (sent)"
            },
            "mode": {
              "type": "string",
              "description": "Send mode (live or mock)"
            },
            "to": {
              "type": "string",
              "description": "Recipient email"
            },
            "from": {
              "type": "string",
              "description": "Sender email"
            },
            "subject": {
              "type": "string",
              "description": "Email subject"
            },
            "bodyLength": {
              "type": "number",
              "description": "Body content length"
            },
            "contentType": {
              "type": "string",
              "description": "Content type (html or text)"
            },
            "timestamp": {
              "type": "string",
              "description": "ISO 8601 timestamp"
            }
          },
          "required": [
            "messageId",
            "status",
            "to",
            "subject"
          ]
        },
    },
  ],
};

import type { Hono } from "hono";


// ATXP: requirePayment only fires inside an ATXP context (set by atxpHono middleware).
// For raw x402 requests, the existing @x402/hono middleware handles the gate.
// If neither protocol is active (ATXP_CONNECTION unset), tryRequirePayment is a no-op.
async function tryRequirePayment(price: number): Promise<void> {
  if (!process.env.ATXP_CONNECTION) return;
  try {
    const { requirePayment } = await import("@atxp/server");
    const BigNumber = (await import("bignumber.js")).default;
    await requirePayment({ price: BigNumber(price) });
  } catch (e: any) {
    if (e?.code === -30402) throw e;
  }
}

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

function validateEmailParts(email: string): { valid: boolean; local: string; domain: string; error?: string } {
  const parts = email.split("@");
  if (parts.length !== 2) return { valid: false, local: "", domain: "", error: "Invalid email format: missing @ symbol" };

  const [local, domain] = parts;
  if (local.length === 0) return { valid: false, local, domain, error: "Empty local part" };
  if (local.length > 64) return { valid: false, local, domain, error: "Local part exceeds 64 characters" };
  if (domain.length === 0) return { valid: false, local, domain, error: "Empty domain" };
  if (!domain.includes(".")) return { valid: false, local, domain, error: "Domain must have at least one dot" };

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return { valid: false, local, domain, error: "Invalid TLD" };

  return { valid: true, local, domain };
}

async function sendViaResend(to: string, from: string, subject: string, body: string, html?: string): Promise<{ messageId: string; status: string }> {
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    // Real Resend API call
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        ...(html ? { html } : { text: body }),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Resend API error: ${response.status} — ${err}`);
    }

    const data = await response.json() as { id: string };
    return { messageId: data.id, status: "sent" };
  }

  // Mock mode — no API key configured
  const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return {
    messageId: mockId,
    status: "mock_accepted",
  };
}

export function registerRoutes(app: Hono) {
  app.post("/api/send", async (c) => {
    await tryRequirePayment(0.003);
    const body = await c.req.json().catch(() => null);

    if (!body?.to) return c.json({ error: "Missing required field: to" }, 400);
    if (!body?.subject) return c.json({ error: "Missing required field: subject" }, 400);
    if (!body?.body && !body?.html) return c.json({ error: "Missing required field: body or html" }, 400);

    const to: string = body.to;
    const from: string = body.from || "noreply@x402.dev";
    const subject: string = body.subject;
    const textBody: string = body.body || "";
    const html: string | undefined = body.html;

    // Validate recipient
    if (!isValidEmail(to)) {
      const validation = validateEmailParts(to);
      return c.json({ error: `Invalid recipient email: ${validation.error || "format error"}` }, 400);
    }

    // Validate sender
    if (!isValidEmail(from)) {
      return c.json({ error: "Invalid sender email format" }, 400);
    }

    // Validate subject
    if (subject.length === 0) return c.json({ error: "Subject cannot be empty" }, 400);
    if (subject.length > 998) return c.json({ error: "Subject too long (max 998 chars)" }, 400);

    try {
      const result = await sendViaResend(to, from, subject, textBody, html);

      const isLive = !!process.env.RESEND_API_KEY;

      return c.json({
        messageId: result.messageId,
        status: result.status,
        mode: isLive ? "live" : "mock",
        to,
        from,
        subject,
        bodyLength: html ? html.length : textBody.length,
        contentType: html ? "html" : "text",
        timestamp: new Date().toISOString(),
        ...(isLive ? {} : { note: "Running in mock mode. Set RESEND_API_KEY environment variable for live delivery." }),
      });
    } catch (err: any) {
      return c.json({ error: "Email delivery failed: " + err.message }, 500);
    }
  });
}

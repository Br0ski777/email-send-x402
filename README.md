# Email Send API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://email-send.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Send emails programmatically via Resend -- text or HTML body, delivery status, message ID. Transactional email. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "email-send": {
      "url": "https://email-send.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://email-send.api.klymax402.com/api/send" \
  -H "Content-Type: application/json" \
  -d '{"to":"...","subject":"...","body":"..."}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `email_send_message` | POST | `/api/send` | $0.008 | Send an email message |

### `email_send_message`

Use this when you need to send an email to one or more recipients. Returns delivery confirmation in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `to` | string | yes | Recipient email address |
| `from` | string | no | Sender email address (default: noreply@x402.dev) |
| `subject` | string | yes | Email subject line |
| `body` | string | yes | Email body content (plain text) |
| `html` | string | no | Email body content (HTML, optional — overrides body) |

Example response:

```json
{"messageId":"msg_01abc123","status":"sent","timestamp":"2026-04-13T14:30:00Z","to":"user@example.com","from":"noreply@x402.dev","subject":"Your Report"}
```

**When to use**: sending transactional emails, notifications, alerts, password resets, order confirmations, and automated reports.

**Not for**: email validation (use `email_verify_address`), finding email addresses (use `email_find_by_name`), person data enrichment (use `person_enrich_from_email`).

## Example agent prompts

- "Send an email to one or more recipients"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT

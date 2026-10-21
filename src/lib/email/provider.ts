/**
 * Transactional email abstraction. Providers are called over HTTPS with fetch –
 * no SDKs, no secrets in the browser.
 *
 * EMAIL_PROVIDER = resend | postmark | none
 */
export type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
};

export type EmailProvider = {
  name: string;
  send(message: EmailMessage): Promise<{ id: string | null }>;
};

export class EmailSendError extends Error {
  constructor(
    message: string,
    readonly retryable = true,
  ) {
    super(message);
    this.name = "EmailSendError";
  }
}

export type EmailConfig =
  | { ok: true; provider: EmailProvider; from: string; recipients: string[] }
  | { ok: false; reason: string };

const TIMEOUT_MS = 10_000;

async function post(url: string, headers: Record<string, string>, body: unknown) {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    throw new EmailSendError(`Network error: ${(error as Error).message}`);
  }
  const text = await response.text();
  if (!response.ok) {
    // 4xx (except 429) are configuration/content errors and will not succeed on retry.
    const retryable = response.status >= 500 || response.status === 429;
    throw new EmailSendError(`HTTP ${response.status}: ${text.slice(0, 300)}`, retryable);
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function resend(apiKey: string, from: string): EmailProvider {
  const base = process.env.RESEND_API_URL ?? "https://api.resend.com";
  return {
    name: "resend",
    async send(m) {
      const data = await post(`${base}/emails`, { Authorization: `Bearer ${apiKey}` }, {
        from,
        to: m.to,
        subject: m.subject,
        text: m.text,
        ...(m.replyTo ? { reply_to: m.replyTo } : {}),
      });
      return { id: typeof data.id === "string" ? data.id : null };
    },
  };
}

function postmark(token: string, from: string): EmailProvider {
  const base = process.env.POSTMARK_API_URL ?? "https://api.postmarkapp.com";
  return {
    name: "postmark",
    async send(m) {
      const data = await post(`${base}/email`, { "X-Postmark-Server-Token": token }, {
        From: from,
        To: m.to.join(","),
        Subject: m.subject,
        TextBody: m.text,
        MessageStream: "outbound",
        ...(m.replyTo ? { ReplyTo: m.replyTo } : {}),
      });
      return { id: typeof data.MessageID === "string" ? data.MessageID : null };
    },
  };
}

export function getEmailConfig(): EmailConfig {
  const name = (process.env.EMAIL_PROVIDER ?? "none").toLowerCase();
  if (name === "none" || name === "") return { ok: false, reason: "EMAIL_PROVIDER is not configured" };

  const from = process.env.EMAIL_FROM;
  const recipients = (process.env.CONTACT_RECIPIENT ?? "")
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  if (!from) return { ok: false, reason: "EMAIL_FROM is not configured" };
  if (!recipients.length) return { ok: false, reason: "CONTACT_RECIPIENT is not configured" };

  if (name === "resend") {
    const key = process.env.RESEND_API_KEY;
    if (!key) return { ok: false, reason: "RESEND_API_KEY is not configured" };
    return { ok: true, provider: resend(key, from), from, recipients };
  }
  if (name === "postmark") {
    const token = process.env.POSTMARK_SERVER_TOKEN;
    if (!token) return { ok: false, reason: "POSTMARK_SERVER_TOKEN is not configured" };
    return { ok: true, provider: postmark(token, from), from, recipients };
  }
  return { ok: false, reason: `Unknown EMAIL_PROVIDER "${name}"` };
}

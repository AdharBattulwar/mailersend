import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  MailerSend,
  EmailParams,
  Sender as MSSender,
  Recipient as MSRecipient,
} from "mailersend";

const app = new Hono();
app.use("*", cors());

const API_KEY = process.env.MAILERSEND_API_KEY || process.env.API_KEY || "";

// small escaper for HTML content
function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.get("/", (c) => {
  return c.json({ ok: true, message: "Hello Hono!" });
});

app.get("/health", (c) => {
  return c.json({ ok: true, message: "MailerSend API is running" });
});

app.post("/api/v1/mail/send", async (c) => {
  try {
    const payload = await c.req.json();

    if (!API_KEY) {
      return c.json(
        { ok: false, error: "MAILERSEND_API_KEY (or API_KEY) is not set" },
        500
      );
    }

    // env defaults provided by you
    const fromEmail = process.env.DEFAULT_FROM_EMAIL;
    const fromName = process.env.DEFAULT_FROM_NAME;
    const toEmail = process.env.DEFAULT_TO_EMAIL;
    const toName = process.env.DEFAULT_TO_NAME;

    if (!fromEmail || !toEmail) {
      return c.json(
        {
          ok: false,
          error: "DEFAULT_FROM_EMAIL and DEFAULT_TO_EMAIL must be set",
        },
        500
      );
    }

    const mailer = new MailerSend({ apiKey: API_KEY });

    // payload expected shape: { subject, data: { fullName, email, mobile, description } }
    const contact = payload?.data ?? {};
    // build html from all fields in contact
    let html = "<h3>Contact message</h3>";
    for (const key of Object.keys(contact)) {
      html += `<p><strong>${escapeHtml(String(key))}:</strong> ${escapeHtml(
        String(contact[key])
      )}</p>`;
    }

    const text = Object.keys(contact)
      .map((k) => `${k}: ${contact[k]}`)
      .join("\n");

    const emailParams = new EmailParams()
      .setFrom(new MSSender(fromEmail, fromName))
      .setTo([new MSRecipient(toEmail, toName)])
      .setSubject(payload?.subject ?? "New contact message")
      .setHtml(html)
      .setText(text);

    if (contact?.email) {
      emailParams.setReplyTo(
        new MSSender(contact.email, contact.fullName ?? undefined)
      );
    }

    const res = await mailer.email.send(emailParams);
    return c.json({ ok: true, result: res }, 200);
  } catch (err: any) {
    console.error("send error", err);
    return c.json({ ok: false, error: err?.message ?? String(err) }, 500);
  }
});

export default app;

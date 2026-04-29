import { Router } from "express";
import { Resend } from "resend";

const router = Router();

const EDITOR_EMAIL = "thefrontpagebulletin@gmail.com";

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "name, email, subject, and message are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Email service not configured." });
    return;
  }

  const resend = new Resend(apiKey);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;">
    <tr><td align="center" style="padding:20px 10px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a1a;max-width:600px;width:100%;">

        <tr><td style="background:#f5f0e8;border-bottom:3px double #1a1a1a;padding:20px 24px;text-align:center;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#1a1a1a;letter-spacing:2px;text-transform:uppercase;">The Front Porch Bulletin</h1>
          <p style="margin:4px 0 0 0;font-family:'Courier New',monospace;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;">Letter to the Editor</p>
        </td></tr>

        <tr><td style="background:#1a1a1a;padding:8px 24px;text-align:center;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:#f5f0e8;text-transform:uppercase;letter-spacing:2px;">${subject}</p>
        </td></tr>

        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px 0;font-family:'Courier New',monospace;font-size:11px;color:#666;border-bottom:1px solid #ccc;padding-bottom:12px;">
            From: <strong>${name}</strong> &lt;${email}&gt;
          </p>
          <div style="font-family:Georgia,serif;font-size:15px;line-height:1.8;color:#1a1a1a;white-space:pre-wrap;">${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</div>
        </td></tr>

        <tr><td style="background:#f5f0e8;border-top:2px solid #1a1a1a;padding:14px 24px;text-align:center;">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:9px;color:#999;text-transform:uppercase;letter-spacing:1px;">Submitted via The Front Porch Bulletin website</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "The Front Porch Bulletin <onboarding@resend.dev>",
      to: EDITOR_EMAIL,
      replyTo: email,
      subject: `Letter to the Editor: ${subject}`,
      html,
    });

    res.status(200).json({ message: "Your letter has been submitted. Thank you!" });
  } catch {
    res.status(500).json({ error: "Failed to send your letter. Please try again." });
  }
});

export default router;

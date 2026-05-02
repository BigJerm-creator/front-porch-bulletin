import { Router } from "express";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient";
import { logger } from "../lib/logger";

const router = Router();

const DONATION_AMOUNTS = [5, 10, 25, 50, 100];

router.get("/config", async (_req, res) => {
  try {
    const publishableKey = await getStripePublishableKey();
    res.json({ publishableKey, amounts: DONATION_AMOUNTS });
  } catch (err) {
    logger.error({ err }, "Failed to get Stripe config");
    res.status(500).json({ error: "Failed to load payment config" });
  }
});

router.post("/create-session", async (req, res) => {
  const { amount } = req.body;
  const cents = Math.round(Number(amount) * 100);

  if (!cents || cents < 100 || cents > 100000) {
    return res.status(400).json({ error: "Amount must be between $1 and $1,000" });
  }

  try {
    const stripe = await getUncachableStripeClient();
    const domain = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domain ? `https://${domain}` : "http://localhost";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation to The Front Porch Bulletin",
              description: "Support your local community newsletter",
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/?donated=1`,
      cancel_url: `${baseUrl}/`,
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Failed to create donation session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

export default router;

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY. Add it to your environment variables.");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export async function createCheckoutSession(params: {
  userId: string;
  credits: number;
  amountCents: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}) {
  const stripe = getStripe();

  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency ?? "usd",
            unit_amount: params.amountCents,
            product_data: {
              name: `${params.credits} credits top-up`,
            },
          },
        },
      ],
      metadata: {
        userId: params.userId,
        credits: String(params.credits),
      },
    },
    {
      idempotencyKey: params.idempotencyKey,
    }
  );
}

export function verifyStripeWebhook(rawBody: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET. Add it to your environment variables.");
  }

  return getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      // TODO: credit user account based on event.data.object.metadata
      return;
    }
    case "payment_intent.payment_failed": {
      // TODO: log or alert failed payment event
      return;
    }
    default: {
      return;
    }
  }
}

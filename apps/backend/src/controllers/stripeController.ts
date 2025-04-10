import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export const stripeWebhook = (req: any, res: any) => {
  try {
    const sig = req.headers['stripe-signature'];
    res.status(200).json({ received: true });
  } catch (err) {
    const error = err as Error;
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.stripeWebhook = (req, res) => {
  try {
    const sig = req.headers['stripe-signature']
    res.status(200).json({ received: true })
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
}

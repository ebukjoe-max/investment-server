import Stripe from 'stripe'
import { logTransaction } from '../../utilities/Transaction.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const StripePay = async (req, res) => {
  const { amount, coin, userId } = req.body
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Buy ${coin}` },
            unit_amount: amount * 100 // in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `https://yourapp.com/success`,
      cancel_url: `https://yourapp.com/cancel`,
      metadata: { userId, coin, amount }
    })
    await logTransaction({
      userId,
      amount,
      coin,
      method: 'Stripe',
      status: 'pending'
    })
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

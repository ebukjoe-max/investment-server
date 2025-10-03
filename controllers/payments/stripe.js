import Stripe from 'stripe'
import dotenv from 'dotenv'
import User from '../../models/userModel.js'
import {
  logTransaction,
  updateTransactionStatus
} from '../../utilities/Transaction.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ✅ Create PaymentIntent
export const createPaymentIntent = async (req, res) => {
  try {
    const { userId, amount, currency = 'usd', method = 'card' } = req.body

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ msg: 'Amount is required' })
    }

    // Create an order (with unique ID for tracking)
    const orderId = new Date().getTime().toString()

    const order = {
      _id: orderId,
      items: [], // no cart items in deposit flow
      total: amount,
      status: 'pending',
      paymentMethod: method
    }

    // Save order to user
    await User.findByIdAndUpdate(userId, {
      $push: { orders: order }
    })

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      metadata: { userId, orderId },
      automatic_payment_methods: { enabled: true }
    })

    // Log transaction
    await logTransaction({
      userId,
      amount,
      coin: 'USD',
      method: 'Stripe',
      status: 'pending',
      refId: orderId
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error('❌ PaymentIntent error:', err)
    res.status(500).json({ msg: 'Payment failed', error: err.message })
  }
}

// ✅ Stripe Webhook
export const stripeWebhook = async (req, res) => {
  let event
  try {
    const sig = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(
      req.body, // ⚠ raw body required
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle successful payment
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    const { userId, orderId } = paymentIntent.metadata

    try {
      // ✅ Update order status
      await User.findOneAndUpdate(
        { _id: userId, 'orders._id': orderId },
        { $set: { 'orders.$.status': 'paid' } }
      )

      // ✅ Update transaction log
      await updateTransactionStatus(orderId, 'paid')

      console.log(`✅ Order ${orderId} for user ${userId} marked as PAID`)
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  res.json({ received: true })
}

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
    const user = await User.findById(userId)

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

    // Send Email to User
    await sendEmail(
      user.email,
      'Deposit Received',
      `
            <p>Hi <b>${user.firstname}</b>,</p>
            <p>You made a deposit of <b>$${amount}</b>. 
            Your transaction is <b>pending admin approval</b>.</p>
            <p>Reference ID: <code>${refId}</code></p>
          `
    )

    // Send Email to Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      'New Deposit Alert',
      `
            <p>User <b>${user.firstname} ${user.lastname}</b> (${user.email}) just made a deposit.</p>
            <ul>
              <li><b>Amount:</b> $${amount}</li>
              <li><b>Method:</b> ${method}</li>
              <li><b>Reference ID:</b> ${refId}</li>
            </ul>
            <p>Login to the admin panel to review and approve this deposit.</p>
          `
    )

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

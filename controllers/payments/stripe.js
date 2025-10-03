import Stripe from 'stripe'
import dotenv from 'dotenv'
import Transactions from '../../models/Transaction.js'
import UserWallet from '../../models/UserWallet.js'
import sendEmail from '../../utilities/sendEmail.js'
import UserInfo from '../../models/userModel.js'
import DepositModel from '../../models/depositModel.js'

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ✅ Create a deposit with Stripe PaymentIntent
export const createCardDeposit = async (req, res) => {
  console.log(req.body)
  try {
    const {
      userId,
      walletId,
      amount,
      coinRate,
      convertedAmount,
      walletsymbol
    } = req.body

    if (
      !userId ||
      !walletId ||
      !amount ||
      !coinRate ||
      !convertedAmount ||
      !walletsymbol
    ) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Find user
    const user = await UserInfo.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check duplicate
    const existingDeposit = await DepositModel.findOne({
      userId,
      walletId,
      method: 'card',
      amount: parseFloat(amount),
      status: 'pending'
    })

    if (existingDeposit) {
      return res.status(409).json({
        message: 'A similar card deposit is already pending.',
        deposit: existingDeposit
      })
    }

    // Create Transaction (pending)
    const transaction = await Transactions.create({
      userId,
      amount: parseFloat(amount),
      coin: walletsymbol,
      type: 'Deposit',
      method: 'card',
      status: 'pending'
    })

    const reference = `CARD-DEP-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`

    // Create Deposit (pending)
    const deposit = await DepositModel.create({
      userId,
      transactionId: transaction._id,
      walletId,
      walletsymbol,
      method: 'card',
      amount,
      coinRate,
      convertedAmount,
      receipt: 'Stripe', // no upload needed
      status: 'pending',
      reference
    })

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe in cents
      currency: 'usd',
      metadata: { userId, walletId, depositId: deposit._id.toString() },
      automatic_payment_methods: { enabled: true }
    })

    // Send email (pending)
    await sendEmail(
      user.email,
      'Card Deposit Initiated',
      `
        <p>Hi <b>${user.firstname}</b>,</p>
        <p>You initiated a deposit of <b>$${convertedAmount}</b> with Card.</p>
        <p>Status: <b>Pending Payment Confirmation</b></p>
        <p>Reference ID: <code>${deposit.reference}</code></p>
      `
    )

    await sendEmail(
      process.env.ADMIN_EMAIL,
      'New Card Deposit Initiated',
      `
        <p>User <b>${user.firstname} ${user.lastname}</b> (${user.email}) initiated a card deposit.</p>
        <ul>
          <li><b>Amount:</b> $${convertedAmount}</li>
          <li><b>Method:</b> Card</li>
          <li><b>Reference ID:</b> ${deposit.reference}</li>
        </ul>
        <p>Awaiting Stripe confirmation...</p>
      `
    )

    res.status(201).json({
      message: 'Card deposit created',
      deposit,
      clientSecret: paymentIntent.client_secret
    })
  } catch (err) {
    console.error('❌ Error creating card deposit:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ Stripe Webhook
export const stripeWebhook = async (req, res) => {
  let event
  try {
    const sig = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(
      req.body, // ⚠️ must use raw body middleware
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    const { userId, depositId } = intent.metadata

    try {
      // Mark deposit as approved
      await DepositModel.findByIdAndUpdate(depositId, { status: 'approved' })

      // Mark transaction as completed
      await Transactions.findOneAndUpdate(
        { _id: intent.metadata.transactionId },
        { status: 'approved' }
      )

      // Credit wallet balance
      await UserWallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: intent.amount_received / 100 } }
      )

      // Notify user
      const user = await UserInfo.findById(userId)
      if (user) {
        await sendEmail(
          user.email,
          'Card Deposit Successful',
          `
            <p>Hi <b>${user.firstname}</b>,</p>
            <p>Your card deposit of <b>$${
              intent.amount_received / 100
            }</b> was successful!</p>
            <p>Funds have been credited to your wallet.</p>
          `
        )
      }

      console.log(`✅ Deposit ${depositId} marked as approved`)
    } catch (err) {
      console.error('❌ Failed to update deposit on webhook:', err)
    }
  }

  res.json({ received: true })
}

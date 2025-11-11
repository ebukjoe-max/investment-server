import Transactions from '../../models/Transaction.js'
import User from '../../models/userModel.js'
import UserWallet from '../../models/UserWallet.js'
import sendEmail from '../../utilities/sendEmail.js'

export const swapCoins = async (req, res) => {
  try {
    const { userId, fromCoin, toCoin, amountUSD, receiveAmount } = req.body

    if (!userId || !fromCoin || !toCoin || !amountUSD || !receiveAmount) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const wallets = await UserWallet.find({ userId })
    const fromWallet = wallets.find(w => w.symbol === fromCoin)
    const toWallet = wallets.find(w => w.symbol === toCoin)

    if (!fromWallet || Number(fromWallet.balance) < Number(amountUSD)) {
      return res
        .status(400)
        .json({ error: 'Insufficient balance in fromCoin wallet.' })
    }

    // 🔹 Deduct from source wallet (USD amount)
    fromWallet.balance -= parseFloat(amountUSD)

    // 🔹 Add to destination wallet (converted amount)
    if (toWallet) {
      toWallet.balance += parseFloat(receiveAmount)
      await toWallet.save()
    } else {
      await UserWallet.create({
        userId,
        symbol: toCoin,
        balance: parseFloat(receiveAmount),
        network: 'Custom',
        walletAddress: '',
        decimals: 18
      })
    }

    await fromWallet.save()

    // 🔹 Log the swap transaction
    const transaction = await Transactions.create({
      userId,
      type: 'Coin Swap',
      status: 'success',
      method: 'Wallet',
      amount: parseFloat(amountUSD),
      coin: toCoin,
      details: {
        fromCoin,
        toCoin,
        amountUSD,
        receiveAmount
      }
    })

    // 🔹 Prepare email templates
    const userMessage = `
      <p>Hi <b>${user.firstname}</b>,</p>
      <p>Your coin swap was successful:</p>
      <ul>
        <li><b>From:</b> $${amountUSD} of ${fromCoin}</li>
        <li><b>To:</b> ${receiveAmount} ${toCoin}</li>
        <li><b>Status:</b> Success</li>
        <li><b>Reference ID:</b> ${transaction._id}</li>
      </ul>
      <p>You can view this transaction in your dashboard.</p>
    `

    const adminMessage = `
      <p>User <b>${user.firstname} ${user.lastname}</b> (${user.email}) performed a coin swap:</p>
      <ul>
        <li><b>From:</b> $${amountUSD} of ${fromCoin}</li>
        <li><b>To:</b> ${receiveAmount} ${toCoin}</li>
        <li><b>Status:</b> Success</li>
        <li><b>Reference ID:</b> ${transaction._id}</li>
      </ul>
    `

    // 🔹 Send confirmation emails (User + Admin)
    await sendEmail(user.email, 'Coin Swap Successful', userMessage)

    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Coin Swap Alert',
        adminMessage
      )
    }

    res.json({ success: true, message: 'Swap successful', transaction })
  } catch (err) {
    console.error('Swap error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
}

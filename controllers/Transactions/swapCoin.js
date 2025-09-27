import Transactions from '../../models/Transaction.js'
import User from '../../models/userModel.js'
import UserWallet from '../../models/UserWallet.js'
import sendEmail from '../../utilities/sendEmail.js'

export const swapCoins = async (req, res) => {
  try {
    const { userId, fromCoin, toCoin, amount, receiveAmount } = req.body

    if (!userId || !fromCoin || !toCoin || !amount || !receiveAmount) {
      return res.status(400).json({ error: 'Missing required fields.' })
    }

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const wallets = await UserWallet.find({ userId })
    const fromWallet = wallets.find(w => w.symbol === fromCoin)
    const toWallet = wallets.find(w => w.symbol === toCoin)

    if (!fromWallet || Number(fromWallet.balance) < Number(amount)) {
      return res.status(400).json({ error: 'Insufficient balance.' })
    }

    // ✅ Deduct and Add balances
    fromWallet.balance -= parseFloat(amount)
    if (toWallet) {
      toWallet.balance += parseFloat(receiveAmount)
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
    if (toWallet) await toWallet.save()

    // ✅ Log transaction
    const transaction = await Transactions.create({
      userId,
      amount: parseFloat(receiveAmount),
      coin: toCoin,
      type: 'Coin Swap',
      status: 'success',
      method: 'Wallet',
      details: { fromCoin, amount }
    })

    // ✅ Send email to user
    await sendEmail(
      user.email,
      'Coin Swap Successful',
      `
        <p>Hi <b>${user.firstname}</b>,</p>
        <p>Your coin swap was successful:</p>
        <ul>
          <li><b>From:</b> ${amount} ${fromCoin}</li>
          <li><b>To:</b> ${receiveAmount} ${toCoin}</li>
          <li><b>Status:</b> Success</li>
          <li><b>Reference ID:</b> ${transaction._id}</li>
        </ul>
        <p>You can view this transaction in your dashboard.</p>
      `
    )

    // ✅ Send email to Admin (optional)
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'New Coin Swap Alert',
        `
          <p>User <b>${user.firstname} ${user.lastname}</b> (${user.email}) performed a coin swap:</p>
          <ul>
            <li><b>From:</b> ${amount} ${fromCoin}</li>
            <li><b>To:</b> ${receiveAmount} ${toCoin}</li>
            <li><b>Status:</b> Success</li>
            <li><b>Reference ID:</b> ${transaction._id}</li>
          </ul>
        `
      )
    }

    res.json({ success: true, message: 'Swap successful' })
  } catch (err) {
    console.error('Swap error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
}

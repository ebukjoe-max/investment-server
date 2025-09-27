import { logTransaction } from '../../utilities/Transaction.js'

export const cashappTag = (req, res) => {
  res.json({ tag: 'thunderxcash' })
}
export const cashappPay = async (req, res) => {
  try {
    const { amount, coin, userId, receipt } = req.body

    const newTx = await logTransaction({
      userId,
      amount,
      coin,
      method: 'Cash App',
      status: 'pending',
      receiptPath: receipt
    })

    res.json({ tag: 'thunderxcash', transactionId: newTx._id })
  } catch (err) {
    console.error('Cash App payment error:', err)
    res.status(500).json({ message: 'Payment failed' })
  }
}

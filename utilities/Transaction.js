import Transactions from '../models/Transaction.js'

// Log a new transaction
export const logTransaction = async ({
  userId,
  amount,
  coin,
  method,
  receiptPath,
  refId
}) => {
  const newTx = new Transactions({
    userId,
    amount,
    coin,
    type: 'Buy', // can extend later with Sell/Deposit/Withdrawal
    method,
    status: 'pending',
    receipt: receiptPath || null,
    refId: refId || null, // link to orderId if available
    createdAt: new Date()
  })

  return await newTx.save()
}

// Update transaction status (paid, failed, cancelled, etc.)
export const updateTransactionStatus = async (refId, newStatus) => {
  try {
    const updated = await Transactions.findOneAndUpdate(
      { refId },
      { $set: { status: newStatus, updatedAt: new Date() } },
      { new: true }
    )
    return updated
  } catch (err) {
    console.error('❌ updateTransactionStatus error:', err)
    throw err
  }
}

import Transactions from '../models/Transaction.js'

export const logTransaction = async ({
  userId,
  amount,
  coin,
  method,
  receiptPath
}) => {
  const newTx = new Transactions({
    userId,
    amount,
    coin,
    type: 'Buy', // <-- required field
    method,
    status: 'pending', // <-- must match enum in schema
    receipt: receiptPath || null,
    createdAt: new Date()
  })

  return await newTx.save()
}

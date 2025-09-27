import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true
  },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' }, // <-- Add this line
  amount: { type: Number, required: true },
  coin: { type: String, required: true }, // e.g. "USD", "BTC", "ETH"
  type: {
    type: String,
    enum: [
      'Deposit',
      'Withdraw',
      'Coin Swap',
      'Buy',
      'Sell',
      'Interest',
      'Loan',
      'Transfer',
      'Investment Profit',
      'Referral Bonus',
      'Investment'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting payment', 'success', 'rejected', 'failed'],
    default: 'pending'
  },
  method: { type: String, required: true }, // e.g. "Stripe", "Cash App", "Wallet"
  receipt: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
})

const Transactions =
  mongoose.models.Transaction ||
  mongoose.model('Transaction', TransactionSchema)

export default Transactions

import mongoose from 'mongoose'

const withdrawalSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInfo',
      required: true
    },
    amount: { type: Number, required: true },
    coin: { type: String, required: true },
    method: {
      type: String,
      enum: ['crypto', 'bank', 'cashapp', 'applepay'],
      required: true
    },
    details: { type: Object, required: true }, // flexible: cryptoAddress, bankInfo, etc
    status: {
      type: String,
      enum: ['pending', 'success', 'rejected'],
      default: 'pending'
    },
    approvedAt: { type: Date }
  },
  { timestamps: true }
)

const withdrawalModel = mongoose.model('Withdrawal', withdrawalSchema)
export default withdrawalModel

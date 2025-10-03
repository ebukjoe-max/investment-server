// models/deposit.js
import mongoose from 'mongoose'

const depositSchema = new mongoose.Schema(
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
    method: {
      type: String,
      enum: ['crypto', 'bank', 'cashapp', 'applepay', 'card'],
      required: true
    },
    convertedAmount: { type: String, required: true }, // amount after conversion to selected coin
    reference: { type: String, required: true, unique: true },
    coinRate: { type: Number, required: true }, // conversion rate at time of deposit
    walletId: { type: String, required: true, ref: 'UserWallet' }, // selected wallet from gateways
    walletsymbol: { type: String, required: true }, // selected wallet from gateways
    details: { type: Object }, // proof, address, bank info etc
    receipt: { type: String }, // optional uploaded file
    status: {
      type: String,
      enum: ['pending', 'success', 'rejected'],
      default: 'pending'
    },
    approvedAt: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.model('Deposit', depositSchema)

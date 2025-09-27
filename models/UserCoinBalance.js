import mongoose from 'mongoose'

const userCoinBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInfo',
      required: true
    },
    coinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coin',
      required: true
    },
    walletAddress: { type: String, required: true }, // User-specific wallet address
    balance: { type: Number, default: 0 }
  },
  { timestamps: true }
)

userCoinBalanceSchema.index({ userId: 1, coinId: 1 }, { unique: true }) // Prevent duplicates

export default mongoose.models.UserCoinBalance ||
  mongoose.model('UserCoinBalance', userCoinBalanceSchema)

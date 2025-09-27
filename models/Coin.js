import mongoose from 'mongoose'

const coinSchema = new mongoose.Schema(
  {
    symbol: { type: String, required: true, unique: true }, // e.g. BTC
    name: { type: String, required: true }, // e.g. Bitcoin
    network: { type: String, required: true }, // e.g. Ethereum
    decimals: { type: Number, default: 18 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    defaultWalletAddress: { type: String } // Optional: admin’s default address
  },
  { timestamps: true }
)

export default mongoose.models.Coin || mongoose.model('Coin', coinSchema)

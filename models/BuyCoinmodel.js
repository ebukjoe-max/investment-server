import mongoose from 'mongoose'

const buyCoinSchema = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  rate: { type: Number, required: true },
  enabled: {
    type: Boolean,
    default: true,
    index: true
  }
})

const BuyCoin =
  mongoose.models.BuyCoin || mongoose.model('BuyCoin', buyCoinSchema)
export default BuyCoin

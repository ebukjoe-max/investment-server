import mongoose from 'mongoose'

const BankGatewaySchema = new mongoose.Schema(
  {
    provider: { type: String, required: true },
    country: { type: String, required: true },
    publicKey: { type: String, required: true },
    secretKey: { type: String, required: true },
    callbackUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

const BankGateways =
  mongoose.models.BankGateway ||
  mongoose.model('BankGateway', BankGatewaySchema)

export default BankGateways

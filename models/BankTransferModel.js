// models/BankConfig.js
import mongoose from 'mongoose'

const BankTransferSchema = new mongoose.Schema(
  {
    country: { type: String, required: true, unique: true },
    bankName: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    routingNumber: { type: String },
    swiftCode: { type: String },
    iban: { type: String }
  },
  { timestamps: true }
)

export default mongoose.model('BankTransfer', BankTransferSchema)

import mongoose from 'mongoose'

const LoanPlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    interestRate: { type: Number, required: true },
    interestType: {
      type: String,
      enum: ['Fixed', 'Variable'],
      default: 'Fixed'
    },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    duration: { type: Number, required: true },
    durationType: { type: String, enum: ['days', 'months'], default: 'days' },
    capitalBack: { type: Boolean, default: true },
    collateralRequired: { type: Boolean, default: false },
    repaymentFrequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly'],
      default: 'Weekly'
    }
  },
  { timestamps: true }
)

const LoanPlan =
  mongoose.models.LoanPlan || mongoose.model('LoanPlan', LoanPlanSchema)

export default LoanPlan

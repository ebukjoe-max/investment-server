import mongoose from 'mongoose'

const InvestmentPlanSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  profitRate: { type: Number, required: true }, // daily profit %
  durationType: {
    type: String,
    enum: ['days', 'weeks', 'months'],
    required: true
  },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  capitalBack: { type: Boolean, default: false },
  payoutFrequency: { type: String },
  createdAt: { type: Date, default: Date.now }
})

const investmentPlans =
  mongoose.models.InvestmentPlan ||
  mongoose.model('InvestmentPlan', InvestmentPlanSchema)
export default investmentPlans

import mongoose from 'mongoose'

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserInfo',
      required: true
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanPlan',
      required: true
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserWallet',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    interest: {
      type: Number,
      required: true
    },
    totalRepayment: {
      type: Number,
      required: true
    },
    term: {
      type: String, // e.g., '3 Months', '6 Months'
      required: true
    },
    documentUrl: {
      type: String,
      required: false // optional, for KYC
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    appliedOn: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)
const Loan = mongoose.model('Loan', loanSchema)

export default Loan

import mongoose from 'mongoose'

const KycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true
  },
  idDocumentUrl: { type: String, required: true },
  address: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  nextOfKin: { type: String, required: true },
  maidenName: { type: String, required: true },
  nationality: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
})

const Kyc = mongoose.model('Kyc', KycSchema)

export default Kyc

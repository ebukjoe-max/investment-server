import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    refCode: { type: String, unique: true, index: true },
    referredBy: { type: String }, // stores refCode of the inviter
    referralBonus: { type: Number, default: 0 },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],

    email: { type: String, unique: true, required: true },
    phoneNumber: { type: String, unique: true, required: true },

    password: {
      type: String,
      required: function () {
        return !this.provider
      }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    hashedPassword: { type: String },
    userCountry: { type: String },

    wallet: {
      balance: { type: Number, default: 0 },
      coinBalance: { type: Number, default: 0 }
    },

    kyc: {
      idDocumentUrl: { type: String },
      address: { type: String },
      dateOfBirth: { type: String },
      nextOfKin: { type: String },
      maidenName: { type: String },
      nationality: { type: String },
      phone: { type: String },
      email: { type: String },
      status: { type: String, default: 'unverified' },
      submittedAt: { type: Date, default: Date.now }
    },

    loan: {
      active: { type: Boolean, default: false },
      totalBorrowed: { type: Number, default: 0 },
      totalRepaid: { type: Number, default: 0 },
      outstandingBalance: { type: Number, default: 0 }
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'UserInfo'
  }
)

const User = mongoose.models.UserInfo || mongoose.model('UserInfo', UserSchema)

export default User

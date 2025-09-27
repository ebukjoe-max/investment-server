import mongoose from 'mongoose'

const SettingSchema = new mongoose.Schema({
  smsVerification: { type: Boolean, default: true },
  emailVerification: { type: Boolean, default: true },
  twoFactorAuth: { type: Boolean, default: false },
  allowDeposits: { type: Boolean, default: true },
  allowWithdrawals: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  smsSenderName: { type: String, default: 'ThunderXtorm' },
  emailSender: { type: String, default: 'no-reply@thunderxtorm.com' },
  supportEmail: { type: String, default: 'support@thunderxtorm.com' },
  companyName: { type: String, default: 'ThunderXtorm' },
  termsUrl: { type: String, default: 'https://thunderxtorm.com/terms' }
})

const Setting = mongoose.model('Setting', SettingSchema)

export default Setting

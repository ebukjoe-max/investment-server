import mongoose from 'mongoose'

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Welcome Email"
  subject: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, unique: true }, // e.g. "welcome", "deposit", "withdrawal"
  updatedAt: { type: Date, default: Date.now }
})

const EmailTemplateModel = mongoose.model('EmailTemplate', emailTemplateSchema)

export default EmailTemplateModel

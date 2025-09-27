// models/Notification.js
import mongoose from 'mongoose'

const popupNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info'
    },
    active: { type: Boolean, default: true } // control visibility
  },
  { timestamps: true }
)

const popupNotification = mongoose.model(
  'PopNotification',
  popupNotificationSchema
)

export default popupNotification

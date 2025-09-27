import sendEmail from '../../utilities/sendEmail.js'
import generateOTP from '../../utilities/genOtp.js'
import User from '../../models/userModel.js'
import Otp from '../../models/otpModel.js'
import bcrypt from 'bcryptjs'

// Send OTP
export const sendOtp = async (req, res) => {
  const email = req.body.email.toLowerCase()

  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    const otp = generateOTP()

    // Remove old OTPs
    await Otp.deleteMany({ email })

    // Save new OTP with expiry (5 minutes)
    await Otp.create({
      email,
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 mins from now
    })

    // Send OTP email with template
    await sendEmail(
      email,
      'Your OTP Code',
      `
        <p>Hi <b>${user.firstname}</b>,</p>
        <p>You requested to reset your password. Use the OTP below:</p>
        <h2 style="text-align:center;letter-spacing:5px;">${otp}</h2>
        <p>This OTP will expire in <b>5 minutes</b>. Do not share it with anyone.</p>
      `
    )

    res.json({ message: 'OTP sent to email' })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ message: 'Error sending OTP' })
  }
}

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body

  try {
    const otpRecord = await Otp.findOne({ email, otp })
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    // Check expiry
    if (otpRecord.expiresAt < Date.now()) {
      await Otp.deleteOne({ _id: otpRecord._id })
      return res.status(400).json({ message: 'OTP expired' })
    }

    // OTP valid — delete to prevent reuse
    await Otp.deleteOne({ _id: otpRecord._id })

    res.json({ message: 'OTP Verified' })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ message: 'Error verifying OTP' })
  }
}

// Reset Password
export const resetOtp = async (req, res) => {
  const { email, newPassword } = req.body
  const normalizedEmail = email.toLowerCase()

  try {
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    // Hash the new password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    user.password = newPassword
    user.hashedPassword = hashedPassword
    await user.save()

    // Send confirmation email
    await sendEmail(
      email,
      'Password Reset Successful',
      `
        <p>Hi <b>${user.firstname}</b>,</p>
        <p>Your password has been successfully reset. You can now log in with your new credentials.</p>
        <p>If you did not request this change, please contact support immediately.</p>
      `
    )

    res.status(200).json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset OTP error:', error)
    res.status(500).json({ message: 'Failed to reset password' })
  }
}

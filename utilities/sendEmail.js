import nodemailer from 'nodemailer'
import emailContentTemplate from './emailContentTemplate.js'

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587, // 👈 try 587
  secure: false, // 👈 must be false for 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error)
  } else {
    console.log('✅ SMTP Server is ready to send messages')
  }
})

const sendEmail = async (to, subject, bodyContent) => {
  const html = emailContentTemplate({ title: subject, body: bodyContent })

  const mailOptions = {
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html
  }

  return transporter.sendMail(mailOptions)
}

export default sendEmail

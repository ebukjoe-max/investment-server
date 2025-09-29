import nodemailer from 'nodemailer'
import emailContentTemplate from './emailContentTemplate.js'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: process.env.MAIL_POOL === 'true',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
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

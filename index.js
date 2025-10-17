import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import helmet from 'helmet'
import mongodbConnection from './configs/mongbDb.js'
import authRoutes from './routes/auth/auth.js'
import adminRoutes from './routes/admin/admin.js'
import userRoutes from './routes/user/users.js'
import transactionRoutes from './routes/user/userTransaction.js'
import paymentRoutes from './routes/payments/payment.js'
import loanRoutes from './routes/loan/loan.js'
import investmentRoutes from './routes/Investment/investment.js'
import { EventEmitter } from 'events'
import { authMiddleware } from './middleware/authMiddleware.js'
import nodeCron from 'node-cron'
import { processInvestments } from './configs/processInvestments.js'

EventEmitter.defaultMaxListeners = 20

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.set('trust proxy', 1)
app.use(cookieParser())
app.use(helmet())
app.use(express.json())

const allowedOrigins = [
  'https://app.solnance.com',
  'http://localhost:3000',
  'https://admin.solnance.com'
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  })
)

// CRON JOBS
nodeCron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Running investment processor every 5 minutes...')
  await processInvestments()
})

// Routes
app.use('/auth', authRoutes)
app.use('/admin', authMiddleware, adminRoutes)
app.use('/user', authMiddleware, userRoutes)
app.use('/transactions', authMiddleware, transactionRoutes)
app.use('/investments', investmentRoutes)
app.use('/loans', loanRoutes)
app.use('/payment', authMiddleware, paymentRoutes)
// app.get('/backend', (req, res) => {
//   res.send('Backend root is running fine ✅');
// });
app.get('/backend', (req, res) => res.redirect('/'))
app.get('/', (req, res) => {
  res.send('Server is running fine ✅')
})

// Cron test route
app.get('/cron/process-investments', async (req, res) => {
  await processInvestments()
  res.json({ status: 'ok', message: 'Investments processed' })
})

// MongoDB connection
mongodbConnection()

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))

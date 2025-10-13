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

const app = express()

// middlewares
app.set('trust proxy', 1)
app.use(cookieParser())
app.use(helmet())
dotenv.config()
app.use(express.json())
const allowedOrigins = [
  'http://localhost:3000',
  'http://10.0.1.23:3000',
  'http://192.168.248.88:3001',
  'http://172.20.10.2:3000',
  'http://192.168.254.88:3001',
  'https://thurderxtorm.netlify.app',
  'https://thurderxfinanceltd.netlify.app'
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  })
)

// Run every day at midnight server time
nodeCron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily investment processor...')
  await processInvestments()
})

// Optional: run every X minutes for testing
nodeCron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Running investment processor every 5 minutes...')
  await processInvestments()
})

// ROUTES
app.use('/auth', authRoutes)
app.use('/admin', authMiddleware, adminRoutes)
app.use('/user', authMiddleware, userRoutes)
app.use('/transactions', authMiddleware, transactionRoutes)
app.use('/investments', investmentRoutes)
app.use('/loans', loanRoutes)
app.use('/payment', authMiddleware, paymentRoutes)
app.get('/', (req, res) => {
  try {
    console.log('server is running on port 5000')
    res.send('Serving is running')
  } catch (error) {
    console.log('error', error)
    res.send('server failed')
  }
})
// CRON JOB
// curl -s https://yourdomain.com/cron/process-investments
app.get('/cron/process-investments', async (req, res) => {
  await processInvestments()
  res.json({ status: 'ok', message: 'Investments processed' })
})

mongodbConnection()

app.listen(5000, console.log(' server is up and running'))

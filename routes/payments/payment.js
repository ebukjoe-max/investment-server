import express from 'express'
import {
  createPaymentIntent,
  stripeWebhook
} from '../../controllers/payments/stripe.js'
import { paypalPay } from '../../controllers/payments/paypal.js'
import { cashappTag, cashappPay } from '../../controllers/payments/cashapp.js'

const router = express.Router()

router.post('/create-payment-intent', createPaymentIntent)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)
router.post('/paypal', paypalPay)
router.post('/cashapp', cashappPay)
router.get('/cashapp/tag', cashappTag)

export default router

import express from 'express'
import { StripePay } from '../../controllers/payments/stripe.js'
import { paypalPay } from '../../controllers/payments/paypal.js'
import { cashappTag, cashappPay } from '../../controllers/payments/cashapp.js'

const router = express.Router()

router.post('/stripe', StripePay)
router.post('/paypal', paypalPay)
router.post('/cashapp', cashappPay)
router.get('/cashapp/tag', cashappTag)

export default router

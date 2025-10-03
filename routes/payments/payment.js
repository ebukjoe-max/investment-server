import express from 'express'
import { paypalPay } from '../../controllers/payments/paypal.js'
import { cashappTag, cashappPay } from '../../controllers/payments/cashapp.js'

const router = express.Router()

router.post('/paypal', paypalPay)
router.post('/cashapp', cashappPay)
router.get('/cashapp/tag', cashappTag)

export default router

import express from 'express'
import {
  getAlltransactions,
  getTransactions,
  getUsersWithBalance,
  getUserTransaction,
  postUserTransaction
} from '../../controllers/Transactions/userTransaction.js'
import { swapCoins } from '../../controllers/Transactions/swapCoin.js'

import { withdrawFunds } from '../../controllers/Transactions/withdrawal.js'
import {
  getWithdrawals,
  updateWithdrawalStatus
} from '../../controllers/admin/AdmWithdrawalController.js'
import {
  createDeposit,
  getAllDeposits,
  updateDepositStatus
} from '../../controllers/Transactions/deposit.js'
import {
  createCardDeposit,
  stripeWebhook
} from '../../controllers/payments/stripe.js'

const router = express.Router()

// USER TRANSACTION
router.get('/', getAlltransactions)
router.get('/transactions', getTransactions)
router.get('/users', getUsersWithBalance)
router.get('/:userId', getUserTransaction)
router.post('/', postUserTransaction)

// SWAP COIN
router.post('/swap', swapCoins)

// WITHDRAWAL
router.post('/withdrawFunds', withdrawFunds)
router.get('/withdraw/withdrawal', getWithdrawals)
router.put('/withdrawal/:id/status', updateWithdrawalStatus)

// DEPOSIT

router.post('/create-payment-intent', createCardDeposit)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
)
router.get('/deposit/user', getAllDeposits) // get all user deposits
router.post('/deposit', createDeposit) // user submit deposit
router.put('/deposit/:id/status', updateDepositStatus)

export default router

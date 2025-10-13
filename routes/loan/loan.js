import express from 'express'
import {
  addCollateral,
  applyForLoan,
  approveLoan,
  createLoanPlan,
  deleteLoan,
  deleteUserLoan,
  getAllLoanPlans,
  getAllUsersLoans,
  getLoanHistory,
  updateLoan
} from '../../controllers/loan/loan.js'
import { authMiddleware } from '../../middleware/authMiddleware.js'

const router = express.Router()
router.post('/create', authMiddleware, createLoanPlan) // POST: create new loan plan
router.post('/applyforloan', authMiddleware, applyForLoan)
router.get('/getAllUsersLoans/all', authMiddleware, getAllUsersLoans)
router.patch('/:id', authMiddleware, approveLoan)
router.delete('/:id', authMiddleware, deleteUserLoan)
router.patch('/addCollateral', authMiddleware, addCollateral)
router.get('/getLoanHistory/:userId', authMiddleware, getLoanHistory)
router.get('/all', getAllLoanPlans) // GET: fetch all loan plans
router.delete('/:id', authMiddleware, deleteLoan)
router.put('/:id', authMiddleware, updateLoan)

export default router

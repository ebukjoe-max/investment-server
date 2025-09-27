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

const router = express.Router()
router.post('/create', createLoanPlan) // POST: create new loan plan
router.post('/applyforloan', applyForLoan)
router.get('/getAllUsersLoans/all', getAllUsersLoans)
router.patch('/:id', approveLoan)
router.delete('/:id', deleteUserLoan)
router.patch('/addCollateral', addCollateral)
router.get('/getLoanHistory/:userId', getLoanHistory)
router.get('/all', getAllLoanPlans) // GET: fetch all loan plans
router.delete('/:id', deleteLoan)
router.put('/:id', updateLoan)

export default router

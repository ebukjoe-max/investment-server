import express from 'express'
import {
  createInvestmentplan,
  deleteInvestmentPlan,
  getAllInvestmentPlans,
  getAllUserInvestments,
  getUserInvestments,
  postUserInvestment,
  updateInvestmentPlan
} from '../../controllers/investment/Investment.js'
import { authMiddleware } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllInvestmentPlans)
router.delete('/:id', authMiddleware, deleteInvestmentPlan)
router.put('/:id', authMiddleware, updateInvestmentPlan)
router.post('/user-investments', authMiddleware, postUserInvestment)
router.get('/:userId', authMiddleware, getUserInvestments)
router.get('/all/investments', authMiddleware, getAllUserInvestments)
router.post('/create-plan', authMiddleware, createInvestmentplan)

export default router

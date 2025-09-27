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

const router = express.Router()

router.get('/', getAllInvestmentPlans)
router.delete('/:id', deleteInvestmentPlan)
router.put('/:id', updateInvestmentPlan)
router.post('/user-investments', postUserInvestment)
router.get('/:userId', getUserInvestments)
router.get('/all/investments', getAllUserInvestments)
router.post('/create-plan', createInvestmentplan)

export default router

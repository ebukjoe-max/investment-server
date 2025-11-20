import userInvestment from '../models/userInvestmentModel.js'
import UserWallet from '../models/UserWallet.js'
import UserInfo from '../models/userModel.js'
import sendEmail from '../utilities/sendEmail.js'
import Transactions from '../models/Transaction.js'

export const processInvestments = async () => {
  try {
    const now = new Date()

    // Find active investments whose payout is due
    const dueInvestments = await userInvestment
      .find({
        status: 'active',
        nextPayoutDate: { $lte: now }
      })
      .populate('planId')

    for (const inv of dueInvestments) {
      const { amount, planId, userId, currentDay, durationDays } = inv
      const user = await UserInfo.findById(userId)

      // 🚨 Prevent crash if user not found
      if (!user) {
        console.warn(
          `⚠️ Skipping investment ${inv._id}: user not found (${userId})`
        )
        continue
      }

      const profitRate = planId?.profitRate || inv.dailyProfitRate
      const payoutFrequency = planId?.payoutFrequency
        ? Number(planId.payoutFrequency)
        : 1

      const profit = (amount * profitRate) / 100

      // Credit profit to wallet
      await UserWallet.updateOne({ userId }, { $inc: { balance: profit } })

      // Record profit transaction
      await Transactions.create({
        userId,
        amount: profit,
        coin: inv.walletSymbol || 'USD',
        type: 'Investment Profit',
        status: 'success',
        method: 'System',
        details: {
          plan: planId?.name || 'Custom Plan',
          investmentId: inv._id,
          day: inv.currentDay + payoutFrequency
        }
      })

      // Notify user
      await sendEmail(
        user.email,
        'Investment Profit Credited',
        `
          <p>Hi <b>${user.firstname}</b>,</p>
          <p>Your investment just generated a profit payout:</p>
          <ul>
            <li><b>Plan:</b> ${planId?.name}</li>
            <li><b>Amount Credited:</b> $${profit.toFixed(2)}</li>
            <li><b>Date:</b> ${now.toLocaleString()}</li>
          </ul>
          <p>You can track this transaction in your dashboard.</p>
          <p>Thank you for trusting us.</p>
        `
      )

      // Notify admin
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'Investment Profit Credited',
        `
          <p>Hi Admin,</p>
          <p>User <b>${user.firstname}</b> just received a profit payout.</p>
          <ul>
            <li><b>Plan:</b> ${planId?.name}</li>
            <li><b>Amount Credited:</b> $${profit.toFixed(2)}</li>
            <li><b>Date:</b> ${now.toLocaleString()}</li>
          </ul>
        `
      )

      // Update investment
      inv.totalPaid += profit
      inv.currentDay += payoutFrequency
      inv.lastUpdated = now

      const nextDate = new Date(inv.nextPayoutDate)
      nextDate.setDate(nextDate.getDate() + payoutFrequency)
      inv.nextPayoutDate = nextDate

      // Complete investment if fully matured
      if (inv.currentDay >= durationDays) {
        inv.status = 'completed'

        if (planId?.capitalBack) {
          await UserWallet.updateOne({ userId }, { $inc: { balance: amount } })

          await Transactions.create({
            userId,
            amount,
            coin: inv.walletSymbol || 'USD',
            type: 'Capital Return',
            status: 'success',
            method: 'System',
            details: {
              plan: planId?.name || 'Custom Plan',
              investmentId: inv._id
            }
          })

          await sendEmail(
            user.email,
            'Investment Completed - Capital Returned',
            `
              <p>Hi <b>${user.firstname}</b>,</p>
              <p>Your investment has completed successfully:</p>
              <ul>
                <li><b>Plan:</b> ${planId?.name}</li>
                <li><b>Capital Returned:</b> $${amount}</li>
                <li><b>Total Profit Earned:</b> $${inv.totalPaid.toFixed(
                  2
                )}</li>
              </ul>
              <p>We appreciate your trust and look forward to your next investment.</p>
            `
          )
        }
      }

      await inv.save()
    }

    console.log(`✅ Processed ${dueInvestments.length} investments.`)
  } catch (err) {
    console.error('Error processing investments:', err)
  }
}

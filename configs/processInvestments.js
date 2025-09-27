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

      // Pull values from plan first, fallback to investment
      const profitRate = planId?.profitRate || inv.dailyProfitRate
      const payoutFrequency = planId?.payoutFrequency
        ? Number(planId.payoutFrequency)
        : 1

      // ✅ Profit per payout cycle
      const profit = (amount * profitRate) / 100

      // Credit profit to wallet
      await UserWallet.updateOne({ userId }, { $inc: { balance: profit } })

      // 🎯 Record profit transaction
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

      // 📧 Email user about profit
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
      // 📧 Email user about profit
      await sendEmail(
        process.env.ADMIN_EMAIL,
        'Investment Profit Credited',
        `
          <p>Hi Admin </p>
          <p>User <b>${
            user.firstname
          }</b>, investment just generated a profit payout:</p>
          <ul>
            <li><b>Plan:</b> ${planId?.name}</li>
            <li><b>Amount Credited:</b> $${profit.toFixed(2)}</li>
            <li><b>Date:</b> ${now.toLocaleString()}</li>
          </ul>
          <p>You can track this transaction in your dashboard.</p>
          <p>Thank you for trusting us.</p>
        `
      )

      // Update investment state
      inv.totalPaid += profit
      inv.currentDay += payoutFrequency
      inv.lastUpdated = now

      // Schedule next payout
      const nextDate = new Date(inv.nextPayoutDate)
      nextDate.setDate(nextDate.getDate() + payoutFrequency)
      inv.nextPayoutDate = nextDate

      // ✅ Complete investment
      if (inv.currentDay >= durationDays) {
        inv.status = 'completed'

        // Return capital if allowed
        if (planId?.capitalBack) {
          await UserWallet.updateOne({ userId }, { $inc: { balance: amount } })

          // 🎯 Record Investment Profit transaction
          await Transactions.create({
            userId,
            amount,
            coin: inv.walletSymbol || 'USD',
            type: 'Investment Profit',
            status: 'success',
            method: 'System',
            details: {
              plan: planId?.name || 'Custom Plan',
              investmentId: inv._id
            }
          })

          // 📧 Email user about Investment Profit
          await sendEmail(
            user.email,
            'Investment Completed - Investment Profited',
            `
              <p>Hi <b>${user.firstname}</b>,</p>
              <p>Your investment has completed successfully:</p>
              <ul>
                <li><b>Plan:</b> ${planId?.name}</li>
                <li><b>Investment Profited:</b> $${amount}</li>
                <li><b>Total Profit Earned:</b> $${inv.totalPaid.toFixed(
                  2
                )}</li>
              </ul>
              <p>We appreciate your trust. You can reinvest anytime via your dashboard.</p>
            `
          )
        }
      }

      await inv.save()
    }

    console.log(`Processed ${dueInvestments.length} investments.`)
  } catch (err) {
    console.error('Error processing investments:', err)
  }
}

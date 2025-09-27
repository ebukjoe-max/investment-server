import User from '../../models/userModel.js'

// Get referrals for a user
export const getReferrals = async (req, res) => {
  try {
    const { code } = req.params
    if (!code) {
      return res.status(400).json({ message: 'Referral code is required.' })
    }

    const referredUsers = await User.find({ referredBy: code }).select(
      'firstname lastname email createdAt userBalance earningsFromReferrals'
    )

    if (!referredUsers.length) {
      return res.status(200).json({ referrals: [], totalEarnings: 0 })
    }

    const referrals = referredUsers.map(user => ({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      joined: user.createdAt,
      balance: user.userBalance || 0,
      earnings: user.earningsFromReferrals || 0
    }))

    const totalEarnings = referrals.reduce((acc, r) => acc + r.earnings, 0)

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals,
      totalEarnings
    })
  } catch (err) {
    console.error('Error fetching referrals:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

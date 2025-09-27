import User from '../../models/userModel.js'

export const updateUserProfile = async (req, res) => {
  const { userId, firstname, lastname, email, phoneNumber, userCountry } =
    req.body

  try {
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.firstname = firstname || user.firstname
    user.lastname = lastname || user.lastname
    user.email = email || user.email
    user.phoneNumber = phoneNumber || user.phoneNumber
    user.userCountry = userCountry || user.userCountry

    await user.save()
    res.status(200).json({ message: 'Profile updated successfully', user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong' })
  }
}

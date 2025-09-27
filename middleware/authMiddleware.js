import jwt from 'jsonwebtoken'
import UserInfo from '../models/userModel.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const token = authHeader.split(' ')[1] // Get token after "Bearer"
    if (!token) {
      return res.status(401).json({ message: 'Token missing' })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Optional: fetch fresh user data (ensures user still exists / role updated)
    const user = await UserInfo.findById(decoded.userId).select(
      '-hashedPassword'
    )
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // Attach to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email
    }

    next()
  } catch (err) {
    console.error('❌ Auth error:', err)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// import Session from '../models/Session.js'
// import UserInfo from '../models/userModel.js'

// export const authMiddleware = async (req, res, next) => {
//   console.log(req.cookies)
//   try {
//     const { sessionId } = req.cookies

//     if (!sessionId) {
//       return res.status(401).json({ message: 'Not authenticated' })
//     }

//     const session = await Session.findOne({ sessionId })
//     if (!session || session.expiresAt < new Date()) {
//       return res
//         .status(401)
//         .json({ message: 'Session expired, please login again' })
//     }

//     const user = await UserInfo.findById(session.userId).select(
//       '-hashedPassword'
//     )
//     if (!user) {
//       return res.status(401).json({ message: 'User not found' })
//     }

//     // Attach user info to request
//     req.user = {
//       id: user._id.toString(),
//       role: user.role,
//       email: user.email
//     }

//     next()
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ message: 'Server error' })
//   }
// }

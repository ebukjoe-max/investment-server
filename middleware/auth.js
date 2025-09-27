import jwt from 'jsonwebtoken'
import { jwtSecret } from '../utilities/jwtSecret.js'

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, jwtSecret)
    req.user = decoded // contains userId
    next()
  } catch (err) {
    return res.status(403).json({ message: 'Invalid/Expired token' })
  }
}

export default authenticate

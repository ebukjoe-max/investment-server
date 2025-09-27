import UserInfo from '../../models/userModel.js'
import bcrypt from 'bcryptjs'
import sendEmail from '../../utilities/sendEmail.js'
import Session from '../../models/Session.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const getCookieOptions = req => {
  const ua = req.headers['user-agent'] || ''
  const isIphone = /iPhone|iPad|iPod/i.test(ua)
  const isProduction = process.env.NODE_ENV === 'production'
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https'

  // Default to "local" flags
  let options = {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 1000
  }

  if (isProduction) {
    if (isIphone) {
      // iPhone in production: use local flags
      options.secure = false
      options.sameSite = 'Lax'
    } else {
      // Non-iPhone in production: use production flags
      options.secure = isHttps
      options.sameSite = 'None'
    }
  }
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('Cookie options:', options, isProduction)
  return options
}

// export const login = async (req, res) => {
//   const { email, password } = req.body

//   try {
//     const user = await UserInfo.findOne({ email })
//     if (!user) {
//       return res
//         .status(404)
//         .json({ status: 'error', message: 'No record found' })
//     }

//     const isMatch = await bcrypt.compare(password, user.hashedPassword)
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ status: 'error', message: 'Invalid password' })
//     }

//     // Generate unique sessionId per login
//     const sessionId = crypto.randomBytes(64).toString('hex')
//     const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 60 mins

//     // Create or update user session
//     await Session.findOneAndUpdate(
//       { userId: user._id },
//       { sessionId, role: user.role, expiresAt, createdAt: new Date() },
//       { upsert: true, new: true }
//     )

//     // Set the session cookie
//     res.cookie('sessionId', sessionId, getCookieOptions(req))

//     // Send login confirmation email to User
//     await sendEmail(
//       user.email,
//       'Login Successful',
//       `
//         <p>Hi <b>${user.firstname}</b>,</p>
//         <p>You have successfully logged in to your account.</p>
//         <p>If this wasn't you, please reset your password immediately.</p>
//         <li><b>Time:</b> ${new Date().toLocaleString()}</li>
//       `
//     )

//     // Notify Admin
//     await sendEmail(
//       process.env.ADMIN_EMAIL,
//       'User Login Alert',
//       `
//         <p>User <b>${user.firstname} ${user.lastname}</b> just logged in.</p>
//         <ul>
//           <li><b>Email:</b> ${user.email}</li>
//           <li><b>Role:</b> ${user.role}</li>
//           <li><b>Time:</b> ${new Date().toLocaleString()}</li>
//         </ul>
//       `
//     )

//     res.json({
//       message: 'Login successful',
//       user: { id: user._id, role: user.role, email: user.email }
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ status: 'error', message: 'Server error' })
//   }
// }

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await UserInfo.findOne({ email })
    if (!user) {
      return res
        .status(404)
        .json({ status: 'error', message: 'No record found' })
    }

    const isMatch = await bcrypt.compare(password, user.hashedPassword)
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Invalid password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // ⏳ expires in 1 hour
    )

    // (Optional) track sessions in DB for auditing / force logout
    const sessionId = crypto.randomBytes(64).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 60 mins
    await Session.findOneAndUpdate(
      { userId: user._id },
      { sessionId, role: user.role, expiresAt, createdAt: new Date() },
      { upsert: true, new: true }
    )

    // Send login confirmation email to User
    await sendEmail(
      user.email,
      'Login Successful',
      `
        <p>Hi <b>${user.firstname}</b>,</p>
        <p>You have successfully logged in to your account.</p>
        <p>If this wasn't you, please reset your password immediately.</p>
        <li><b>Time:</b> ${new Date().toLocaleString()}</li>
      `
    )

    // Notify Admin
    await sendEmail(
      process.env.ADMIN_EMAIL,
      'User Login Alert',
      `
        <p>User <b>${user.firstname} ${user.lastname}</b> just logged in.</p>
        <ul>
          <li><b>Email:</b> ${user.email}</li>
          <li><b>Role:</b> ${user.role}</li>
          <li><b>Time:</b> ${new Date().toLocaleString()}</li>
        </ul>
      `
    )

    // Send back token + user info
    res.json({
      message: 'Login successful',
      token, // 🔑 frontend should store this in localStorage
      user: { id: user._id, role: user.role, email: user.email }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'error', message: 'Server error' })
  }
}

export const logout = async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId
    if (sessionId) await Session.deleteOne({ sessionId })
    // res.clearCookie: omit maxAge to avoid Express 5 deprecation
    const options = { ...getCookieOptions(req) }
    delete options.maxAge
    res.clearCookie('sessionId', options)
    res.json({ message: 'Logged out successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// export const verifySession = async (req, res, next) => {
//   try {
//     const sessionId = req.cookies.sessionId
//     if (!sessionId) return res.status(401).json({ error: 'Not authenticated' })

//     const session = await Session.findOne({ sessionId })
//     if (!session || session.expiresAt < new Date()) {
//       return res.status(401).json({ error: 'Session expired' })
//     }

//     req.user = { id: session.userId, role: session.role }
//     next()
//   } catch (err) {
//     console.error(err)
//     return res.status(500).json({ error: 'Server error' })
//   }
// }

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // attach user to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email
    }

    next()
  } catch (err) {
    console.error('verifyToken error:', err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Cookie debug route
export const cookiesTest = (req, res) => {
  res.cookie('testcookie', 'testvalue', {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  })
  res.send('Cookie set!')
}

export const getMe = async (req, res) => {
  try {
    const user = await UserInfo.findById(req.user.id).select(
      '-password -hashedPassword'
    )
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({
      userId: user._id,
      role: user.role
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

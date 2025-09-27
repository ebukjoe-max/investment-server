import crypto from 'crypto'

// jso web token
export const jwtSecret = crypto.randomBytes(64).toString('hex')

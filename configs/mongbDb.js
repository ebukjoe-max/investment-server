import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const mongoUrl = process.env.MONGODB_URI

const mongodbConnection = async () => {
  try {
    await mongoose.connect(mongoUrl)
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB Connection Failed:', error)
    process.exit(1)
  }
}

export default mongodbConnection

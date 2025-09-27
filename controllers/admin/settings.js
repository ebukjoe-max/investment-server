import express from 'express'
import Setting from '../../models/Settings.js'

const router = express.Router()

// GET settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOne()
    if (!settings) {
      return res.status(200).json({ message: 'No settings found', data: null })
    }
    res.json(settings) // frontend gets actual doc
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Create or update settings (always single doc)
export const updateSettings = async (req, res) => {
  try {
    const updated = await Setting.findOneAndUpdate(
      {}, // match anything
      req.body, // update with request body
      { new: true, upsert: true } // create if not exist
    )
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export default router

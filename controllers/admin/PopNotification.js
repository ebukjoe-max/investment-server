import popupNotification from '../../models/NotificationPopupModel.js'

export const createpopUpNotification = async (req, res) => {
  try {
    const { title, message, type, active } = req.body
    let notif = await popupNotification.findOne({})
    if (notif) {
      notif.title = title
      notif.message = message
      notif.type = type
      notif.active = active
      await notif.save()
    } else {
      notif = await popupNotification.create({ title, message, type, active })
    }
    res.json({ success: true, notification: notif })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// User fetch notification
export const getPopupNotification = async (req, res) => {
  const notif = await popupNotification.findOne({ active: true }).sort({
    updatedAt: -1
  })
  res.json(notif || null)
}

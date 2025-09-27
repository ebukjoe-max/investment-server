import EmailTemplateModel from '../../models/EmailTemplateModel.js'

// Get all templates
export const getEmailTemplate = async (req, res) => {
  try {
    const templates = await EmailTemplateModel.find()
    res.json(templates)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get one template
export const getOneEmailTemplate = async (req, res) => {
  try {
    const template = await EmailTemplateModel.findById(req.params.id)
    if (!template)
      return res.status(404).json({ message: 'Template not found' })
    res.json(template)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create new template
export const createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, type } = req.body
    const template = await EmailTemplateModel.create({
      name,
      subject,
      body,
      type
    })
    res.json(template)
  } catch (err) {
    console.error('❌ Error creating template:', err) // log full error
    res.status(500).json({ message: err.message, stack: err.stack })
  }
}

// Update template
export const updateEmailTemplate = async (req, res) => {
  try {
    const { subject, body } = req.body
    const template = await EmailTemplateModel.findByIdAndUpdate(
      req.params.id,
      { subject, body, updatedAt: Date.now() },
      { new: true }
    )
    if (!template)
      return res.status(404).json({ message: 'Template not found' })
    res.json(template)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Delete template
export const deleteEmailTemplate = async (req, res) => {
  try {
    const deleted = await EmailTemplateModel.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Template not found' })
    res.json({ message: 'Template deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

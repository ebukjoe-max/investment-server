import BankGateways from '../../models/BankGateway.js'

export const getBankGateways = async (req, res) => {
  try {
    const gateways = await BankGateways.find()
    res.json(gateways)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching gateways' })
  }
}

// ✅ Create new gateway
export const createBanGateway = async (req, res) => {
  try {
    const gateway = new BankGateways(req.body)
    await gateway.save()
    res.json(gateway)
  } catch (err) {
    res.status(400).json({ message: 'Error creating gateway' })
  }
}

// ✅ Update gateway
export const updateBankGateway = async (req, res) => {
  try {
    const updated = await Gateway.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: 'Error updating gateway' })
  }
}

// ✅ Delete gateway
export const deletebankgateway = async (req, res) => {
  try {
    await Gateway.findByIdAndDelete(req.params.id)
    res.json({ message: 'Gateway deleted' })
  } catch (err) {
    res.status(400).json({ message: 'Error deleting gateway' })
  }
}

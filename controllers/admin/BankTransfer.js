import BankTransferModel from '../../models/BankTransferModel.js'

export const getBankTransferdetails = async (req, res) => {
  try {
    const configs = await BankTransferModel.find()
    res.json(configs)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Create / Update config by country
export const updateBankTransferdetails = async (req, res) => {
  try {
    const {
      country,
      bankName,
      accountName,
      accountNumber,
      routingNumber,
      swiftCode,
      iban
    } = req.body

    let config = await BankTransferModel.findOne({ country })
    if (config) {
      // update existing
      config.bankName = bankName
      config.accountName = accountName
      config.accountNumber = accountNumber
      config.routingNumber = routingNumber
      config.swiftCode = swiftCode
      config.iban = iban
      await config.save()
    } else {
      config = new BankTransferModel({
        country,
        bankName,
        accountName,
        accountNumber,
        routingNumber,
        swiftCode,
        iban
      })
      await config.save()
    }

    res.json(config)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

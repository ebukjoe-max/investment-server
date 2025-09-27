import Coin from '../../models/Coin.js'

export const getCoinWallet = async (req, res) => {
  try {
    const wallets = await Coin.find().sort({ createdAt: -1 })
    res.json(wallets)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ✅ Add a wallet
export const createCoinwallet = async (req, res) => {
  try {
    const { symbol, name, network, defaultWalletAddress } = req.body

    const wallet = new Coin({
      symbol,
      name,
      network,
      defaultWalletAddress
    })

    await wallet.save()
    res.status(201).json(wallet)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// ✅ Delete wallet
export const deleteCoinWallet = async (req, res) => {
  try {
    await Coin.findByIdAndDelete(req.params.id)
    res.json({ message: 'Wallet deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

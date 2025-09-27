import Transactions from '../../models/Transaction.js'

// Get all transactions with counts per user
export const getTransactions = async (req, res) => {
  try {
    const txStats = await Transactions.aggregate([
      {
        $group: {
          _id: '$userId',
          totalTransactions: { $sum: 1 },
          totalDeposits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Deposit'] }, 1, 0]
            }
          },
          totalWithdraws: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Withdraw'] }, 1, 0]
            }
          },
          amountDeposited: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Deposit'] }, '$amount', 0]
            }
          },
          amountWithdrawn: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Withdraw'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          firstname: '$user.firstname',
          lastname: '$user.lastname',
          email: '$user.email',
          totalTransactions: 1,
          totalDeposits: 1,
          totalWithdraws: 1,
          amountDeposited: 1,
          amountWithdrawn: 1
        }
      }
    ])

    res.status(200).json(txStats)
  } catch (err) {
    console.error('Error fetching transactions:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// Get users with total balance
export const getUsersWithBalance = async (req, res) => {
  try {
    const usersWithBalance = await Transactions.aggregate([
      {
        $group: {
          _id: '$userId',
          totalDeposits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Deposit'] }, '$amount', 0]
            }
          },
          totalWithdraws: {
            $sum: {
              $cond: [{ $eq: ['$type', 'Withdraw'] }, '$amount', 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $addFields: {
          balance: { $subtract: ['$totalDeposits', '$totalWithdraws'] }
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          firstname: '$user.firstname',
          lastname: '$user.lastname',
          email: '$user.email',
          balance: 1,
          totalDeposits: 1,
          totalWithdraws: 1
        }
      }
    ])

    res.status(200).json(usersWithBalance)
  } catch (err) {
    console.error('Error fetching users with balance:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getAlltransactions = async (req, res) => {
  try {
    const transactions = await Transactions.find().sort({ createdAt: -1 })
    res.status(200).json({ status: 'ok', data: transactions })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

// GET all transactions for a user
export const getUserTransaction = async (req, res) => {
  try {
    const transactions = await Transactions.find({
      userId: req.params.userId
    }).sort({ createdAt: -1 })
    res.status(200).json({ status: 'ok', data: transactions })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
}

// POST a new transaction (for testing/demo)
export const postUserTransaction = async (req, res) => {
  const { userId, type, amount, status, description } = req.body
  try {
    const newTx = await Transactions.create({
      userId,
      type,
      amount,
      status,
      description
    })
    res.status(201).json({ status: 'ok', data: newTx })
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message })
  }
}

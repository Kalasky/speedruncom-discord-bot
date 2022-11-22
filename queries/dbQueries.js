const User = require('../models/User')

const createDocument = async (discord_id, speedrun_categories, placings, speedruncom_username) => {
  try {
    const doc = await User.create({
      discord_id: discord_id,
      speedrun_categories: speedrun_categories,
      placings: placings,
      speedruncom_username: speedruncom_username,
      points: 0,
    })
    let counter = 0
    doc.placings.map(async (data) => {
      switch (true) {
        case data == 1:
          counter += 100
          break
        case data == 2:
          counter += 60
          break
        case data == 3:
          counter += 30
          break
        case data == 4:
          counter += 15
          break
        case data == 5:
          counter += 8
          break
        case data >= 6 && data <= 10:
          counter += 5
          break
        case data >= 11:
          counter += 2
          break
        default:
          break
      }
    })
    const updatedDoc = await doc.updateOne({ points: counter })
    return updatedDoc
  } catch (e) {
    console.log(e)
  }
}

const updatesRoles = async () => {
  try {
  } catch (e) {
    console.log(e)
  }
}

module.exports = { createDocument, updatesRoles }

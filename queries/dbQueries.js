const User = require("../models/User");

const createDocument = async (discord_id, speedrun_categories, placings, speedruncom_username) => {
    try {
        const doc = await User.create({
            discord_id: discord_id,
            speedrun_categories: speedrun_categories,
            placings: placings,
            speedruncom_username: speedruncom_username
        }) 
        return doc
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
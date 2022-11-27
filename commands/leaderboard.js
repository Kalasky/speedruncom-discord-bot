const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const User = require('../models/User')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays a global leaderboard based off the built in point system.'),
  async execute(interaction) {
    const docs = await User.find().sort('field -points')

    const lbEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTimestamp()
    .setThumbnail('https://i.imgur.com/Drmr0kZ.png')
    .setTitle('Global Leaderboard')

    docs.map(async (doc, i) => {
      return lbEmbed.addFields({ name: `Rank: ${i+1}`, value: `${doc.speedruncom_username}: ${doc.points}` },)
    })
    
    await interaction.reply({
      embeds: [lbEmbed],
    })
  },
}

const { SlashCommandBuilder, User } = require('discord.js')
const axios = require('axios')
const cheerio = require('cheerio')
const { Client, GatewayIntentBits } = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})
// Checks if the command issuer's discord == discord account linked to their speedrun account
module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Authenticates your account')
    .addStringOption((option) =>
      option.setName('input').setDescription('speedrun.com username goes here').setRequired(true)
    ),
  async execute(interaction) {
    const url = `https://www.speedrun.com/user/${interaction.options.data[0].value}`
    let socials = []
    const fetchData = async () => {
      try {
        let res = await axios(url)
        const $ = cheerio.load(res.data)
        $('#profile-menu > div.profile-container > div.profile-media > p > img').each(function () {
          const discordID = $(this).attr('data-id')
          const discordImg = $(this).attr('src')
          socials.push({ discordID, discordImg })
        })
        // if src attribute is equal to /images/socialmedia/discord.png -> the user has a linked Discord account
        if (socials[0].discordImg === '/images/socialmedia/discord.png') {
          // if user's discord matches the discord linked on speedrun.com
          if (interaction.user.tag === socials[0].discordID) {
            try {
              let response1 = await fetch(`https://www.speedrun.com/api/v1/users/${interaction.options.data[0].value}`)
              let data1 = await response1.json()
              console.log(data1);
              let response2 = await fetch(`https://www.speedrun.com/api/v1/users/${data1.data.id}/personal-bests`)
              let data2 = await response2.json()
              console.log(data2);
            } catch (e) { console.log(e) }
            
            await interaction.reply({
              content: 'Account successfully linked. Your roles have been added to your account!',
            })
            
          } else if (interaction.user.tag !== socials[0].discordID) {
            await interaction.reply({
              content: 'Your linked Discord on speedrun.com does not match your discord account!',
            })
          }
        }
      } catch (e) {
        console.log(e)
        await interaction.reply({
          content: 'Your discord account is not linked to your speedrun.com account!',
        })
      }
    }
    fetchData()
  },
}
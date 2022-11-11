const { SlashCommandBuilder, User, Colors } = require('discord.js')
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
              // fetching user's profile
              const fetchProfile = await fetch(`https://www.speedrun.com/api/v1/users/${interaction.options.data[0].value}`)
              const data1 = await fetchProfile.json()
              // fetch is grabbing the user's ID from the initial call then grabbing all PBs
              const fetchPBs = await fetch(`https://www.speedrun.com/api/v1/users/${data1.data.id}/personal-bests`)
              const data2 = await fetchPBs.json()
              const response = data2.data
              
              // mapping over all user's PBs
              const gameRoles = async () => {
              //   const placings = response.map(async (item) => {
                const gamesFetch = await fetch(`https://www.speedrun.com/api/v1/games/${item.run.game}`)
                const response = await gamesFetch.json()
                
              //   // All games titles the user has a submitted run in
              //   const gameTitles = response.data.names.international
              //   let gameTitlesArr = []
              //   gameTitles.forEach(val => {
              //     gameTitlesArr.push(val)
              //   })
              //   console.log(gameTitlesArr);
              //   // interaction.guild.roles.create({ name: `${item.place}`, color: Colors.Blue }) 
              // })
              
              const gameTitles = response.data.names.international
              const butt = []
              gameTitles.forEach(item => {
                // console.log(item);
                butt.push(item)
              })
              console.log(butt);
              }

              gameRoles()
            
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
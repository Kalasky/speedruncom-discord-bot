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
              const getGameRoles = async () => {
                // mapping over object returned from 'response' and grabbing each game ID
                const titlesArr = await response.map( async item => {
                  const titlesFetch = await fetch(`https://www.speedrun.com/api/v1/games/${item.run.game}`)
                  const response = await titlesFetch.json()
                  const titles = response.data.names.international
                  return titles
                })
                let resolved = Promise.all([...titlesArr]);
                // without awaitResolved, the promise will be pending
                const awaitResolved = await resolved
                // new Set will implicitly remove duplicate elements
                // convert the set back to an array
                let uniqueTitles = [...new Set(awaitResolved)]
                
                // guild roles-object
                const getRoles = async () => {
                const guildRoles = await interaction.guild.roles.cache.map(async (roles) => {
                  const response = await roles
                  const ids = response.id
                  return ids
                })
                
                  let resolved2 = Promise.all([...guildRoles])
                  const awaitResolved2 = await resolved2
                  const roleArr =  [...new Set(awaitResolved2)]
                  // looping through array of all role ids
                  let result = []
                  for (let i = 0; i < roleArr.length; i++) {
                    // removing @everyone id (guild id) from array 
                    if (roleArr[i] === '1040957679029469208') {
                      roleArr.splice(i, 1)
                    }
                    result.push(roleArr[i])
                
                  }    

                }
                await getRoles()

                const mapUniqueTitles = uniqueTitles.map(async item => {
                  // check if role already exists in guild -> returns true or false
                  if (interaction.guild.roles.cache.some((role) => role.name === item)) {
                    const id = await interaction.guild.members.fetch(interaction.user.id)
                    // finding roles in guild that match categories the user runs on speedrun.com
                    const roleName = interaction.guild.roles.cache.find(role => role.name === item)
                    // returning id from each role
                    id.roles.add(roleName.id)
                  } else {
                    const rolesCreated = await interaction.guild.roles.create({ name: `${item} Runner`, color: Colors.Blue })
                    const id = await interaction.guild.members.fetch(interaction.user.id)
                    // grabbing role object from the roles creates from rolesCreated
                    id.roles.add(rolesCreated.id)
                  }
                })
                return mapUniqueTitles
              }

              await getGameRoles()
            } catch (e) { 
              console.log(e) 
            }
            
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
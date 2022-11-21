const { SlashCommandBuilder, User, Colors } = require('discord.js')
const query = require("../queries/dbQueries")
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
        let res = await axios.get(url)
        const $ = cheerio.load(res.data)
        $('#profile-menu > div.profile-container > div.profile-media > p > img').each(function () {
          const discord_id = $(this).attr('data-id')
          const discordImg = $(this).attr('src')
          socials.push({ discord_id, discordImg })
        })

        // if src attribute is equal to /images/socialmedia/discord.png -> the user has a linked Discord account
        if (socials[0].discordImg === '/images/socialmedia/discord.png') {
          // if user's discord matches the discord linked on speedrun.com
          if (interaction.user.tag === socials[0].discord_id) {
            try {
              // fetching user's profile
              const fetchProfile = await fetch(`https://www.speedrun.com/api/v1/users/${interaction.options.data[0].value}`)
              const data1 = await fetchProfile.json()
              // fetch is grabbing the user's ID from the initial call then grabbing all PBs
              const fetchPBs = await fetch(`https://www.speedrun.com/api/v1/users/${data1.data.id}/personal-bests`)
              const data2 = await fetchPBs.json()
              // response returns list of categories the user has a PB in, can contain duplicates which is handled below
              const response = data2.data
              // mapping over all user's PBs
              const getGameRoles = async () => {
                // mapping over object returned from 'response' and grabbing each game ID
                const titlesArr = await response.map( async item => {
                  const titlesFetch = await fetch(`https://www.speedrun.com/api/v1/games/${item.run.game}`)
                  const response = await titlesFetch.json()
                  // international = official game name
                  const titles = response.data.names.international
                  return titles
                })

                const placings = await response.map( async item => { return item.place })
                const resolvePlacings = Promise.all([...placings])
                const awaitPlacings = await resolvePlacings

                const resolved = Promise.all([...titlesArr]);
                // without awaiting 'resolved', the promise will be pending
                const awaitResolved = await resolved
                /* 
                 -> new Set will implicitly remove duplicate elements, duplicate elemtns being the official game categories-
                    because a user can have multiple runs in the same category
                 -> convert the set back to an array
                 -> uniqueTitles array contains all unique category runs from user
                */
                const uniqueTitles = [...new Set(awaitResolved)]
              
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
                  // contains all user role id's w/o @everyone role
                  let uniqueRoles = []
                  
                  // looping through array of all role ids
                  for (let i = 0; i < roleArr.length; i++) {
                    // removing @everyone id (guild id) from array 
                    if (roleArr[i] === interaction.guild.id) {
                      roleArr.splice(i, 1)
                    }
                    uniqueRoles.push(roleArr[i])     
                  }    
                } 
                await getRoles()

                // const userRoles = await id.roles.cache.find(data => console.log(data.name))
                let linked = false 
                
                for (let i = 0; i < uniqueTitles.length; i++) {
                  // finding roles in guild that match the user's category runs
                  const rolesExist = await interaction.guild.roles.cache.find(role => role.name === `${uniqueTitles[i]} Runner`)          
                  const id = await interaction.guild.members.fetch(interaction.user.id)
                    // TODO: once linked, automagically check if the user has ran another category -> apply role with cron job
                    // if user has roles -> stop process
                    if (id.roles.cache.some(role => role.name === `${uniqueTitles[i]} Runner`)) {
                      await interaction.reply({
                        content: 'Your account is already linked!',
                      })
                      // break out of loop if the user already has roles
                      break
                    }
                    // check if role already exists in guild -> returns true or false
                    if (interaction.guild.roles.cache.some((role) => role.name === `${uniqueTitles[i]} Runner`)) { 
                      // returning id from each found role
                      id.roles.add(rolesExist.id)
                      linked = true
                    } else if (rolesExist == undefined) {
                      const rolesCreated = await interaction.guild.roles.create({ name: `${uniqueTitles[i]} Runner`, color: Colors.Blue })
                      const id = await interaction.guild.members.fetch(interaction.user.id)
                      // grabbing role object from the roles created from rolesCreated
                      id.roles.add(rolesCreated.id)
                      linked = true
                    }   
                }
                if (linked == true) {
                  query.createDocument(interaction.user.id, uniqueTitles, awaitPlacings,  interaction.options.data[0].value)
                  await interaction.reply({
                    content: 'Your account has been linked!',
                  })
                }
              }
              await getGameRoles()
            } catch (e) { 
              console.log(e) 
            }  
          } else if (interaction.user.tag !== socials[0].discord_id) {
            await interaction.reply({
              content: 'Your linked Discord on speedrun.com does not match your discord account! If you have recently modified your discord id on speedrun.com, please wait up to 1-2 hours for the API to detect the change. Sorry for the inconvenience!',
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
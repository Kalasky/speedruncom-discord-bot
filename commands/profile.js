const { SlashCommandBuilder } = require("discord.js");
const { Client, GatewayIntentBits } = require('discord.js')
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
    .setName("speedrun")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    async function fetchSM64() {
      const response = await fetch('https://www.speedrun.com/api/v1/users?lookup=adnibhaal')
      const exit = await response.json()
      return exit
    }
    
    fetchSM64().then((exit) => {
      console.log(exit.data[0])
    })
  },
};

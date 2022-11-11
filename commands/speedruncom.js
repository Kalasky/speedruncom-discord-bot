const { SlashCommandBuilder } = require("discord.js");

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

const { SlashCommandBuilder, bold } = require("discord.js");
const { send } = require("../utilityFunctions/messageSend.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suru-ho-ja")
    .setDescription("Spams Comdeeeerrrrr!!")
    .addStringOption((option) =>
      option.setName("custom").setDescription("Spams the custom String")
    )
    .addChannelOption((option) =>
      option
        .setName("channel_to_spam")
        .setDescription("Spams the channel specified")
    ),
  async execute(interaction) {
    const boldString = bold(":saluting_face:");
    await interaction.reply(boldString);

    const channelToSpam = interaction.options.getChannel("channel_to_spam")
      ? interaction.options.getChannel("channel_to_spam").id
      : interaction.channelId;
    const channel = interaction.client.channels.cache.get(channelToSpam);
    const string = interaction.options.getString("custom");
    string
      ? send(channel, string, true).catch((err) => console.log(err))
      : send(channel, undefined, true).catch((err) => console.log(err));
  },
};

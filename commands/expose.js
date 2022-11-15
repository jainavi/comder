const { SlashCommandBuilder, bold } = require("discord.js");
const User = require("../models/User");
const dayjs = require("dayjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("expose")
    .setDescription("Exposes the leetcode stats")
    .addUserOption((option) =>
      option.setName("user").setDescription("Tag the user").setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("days")
        .setDescription("Set the number of days")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser("user");
    const period = interaction.options.getNumber("days");
    const numberQuestion = { total: 0, easy: 0, medium: 0, hard: 0 };
    User.find({ discordId: user.id })
      .then((data) => {
        if (!data) {
          interaction.editReply("Koi user nahi hai aisa behen ke land!");
          return;
        }
        const userData = data[0];
        const questionsArr = userData.leetCode.questions;
        const currDate = dayjs();
        for (let i = 0; i < questionsArr.length; i++) {
          const timeStamp = questionsArr[i].timeStamp;
          if (currDate.diff(timeStamp, "day") <= period) {
            if (questionsArr[i].difficulty == "easy") {
              numberQuestion.easy += questionsArr[i].quantity;
              numberQuestion.total += questionsArr[i].quantity;
            } else if (questionsArr[i].difficulty == "medium") {
              numberQuestion.medium += questionsArr[i].quantity;
              numberQuestion.total += questionsArr[i].quantity;
            } else {
              numberQuestion.hard += questionsArr[i].quantity;
              numberQuestion.total += questionsArr[i].quantity;
            }
          } else {
            break;
          }
        }
        interaction.editReply(
          `${user.username} ne ${period} din me  \`t: ${numberQuestion.total}\`  \`e: ${numberQuestion.easy}\`  \`m: ${numberQuestion.medium}\`  \`h: ${numberQuestion.hard}\` questions nipta deye BC!`
        );
      })
      .catch((err) => {
        console.log(err);
        interaction.editReply("Sorry Can't Fetch! An Error Occured!");
      });
  },
};

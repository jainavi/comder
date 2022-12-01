const { bold } = require("discord.js");
const User = require("../models/User");
const { send } = require("./messageSend");

let extraQues = [];
let extraQuesPings = [];
let cDate = new Date(),
  nDate = new Date();
nDate.setDate(nDate.getDate() + 1);
nDate.setHours(0, 0, 0, 0);

const contentGenerator = async (channel) => {
  let content = "";
  try {
    const userArr = await User.find({});
    userArr.forEach((user, index) => {
      const totalQ = user.leetCode.difficulty.total;
      const easyQ = user.leetCode.difficulty.easy;
      const mediumQ = user.leetCode.difficulty.medium;
      const hardQ = user.leetCode.difficulty.hard;
      if (extraQues.length < index + 1) {
        extraQues.push([
          { difficulty: "total", quantity: totalQ },
          { difficulty: "easy", quantity: easyQ },
          { difficulty: "medium", quantity: mediumQ },
          { difficulty: "hard", quantity: hardQ },
        ]);
        extraQuesPings.push([
          { difficulty: "total", quantity: totalQ },
          { difficulty: "easy", quantity: easyQ },
          { difficulty: "medium", quantity: mediumQ },
          { difficulty: "hard", quantity: hardQ },
        ]);
      }
      if (easyQ - extraQuesPings[index][1].quantity > 0) {
        send(
          channel,
          `**${
            easyQ - extraQuesPings[index][1].quantity
          } easy** Ques. pil gae hai **${user.nickName}** se BC!`
        ).catch((err) => console.log(err));
      }
      if (mediumQ - extraQuesPings[index][2].quantity > 0) {
        send(
          channel,
          `**${
            mediumQ - extraQuesPings[index][2].quantity
          } medium** Ques. pil gae hai **${user.nickName}** se BC!`
        ).catch((err) => console.log(err));
      }
      if (hardQ - extraQuesPings[index][3].quantity > 0) {
        send(
          channel,
          `**${
            hardQ - extraQuesPings[index][3].quantity
          } hard** Ques. pil gae hai **${user.nickName}** se BC!`
        ).catch((err) => console.log(err));
      }

      const userBlock = `${bold(
        user.nickName + ":"
      )}   \`t: ${totalQ}\`  \`e: ${easyQ}\`  \`m: ${mediumQ}\`  \`h: ${hardQ}\`\nToday:   \`t: +${
        -extraQues[index][0].quantity + totalQ
      }\`  \`e: +${-extraQues[index][1].quantity + easyQ}\`  \`m: +${
        -extraQues[index][2].quantity + mediumQ
      }\`  \`h: +${-extraQues[index][3].quantity + hardQ}\`\n\n`;
      content += userBlock;

      extraQuesPings[index][0].quantity = totalQ;
      extraQuesPings[index][1].quantity = easyQ;
      extraQuesPings[index][2].quantity = mediumQ;
      extraQuesPings[index][3].quantity = hardQ;
    });
    if (cDate > nDate) {
      extraQues = [];
      extraQuesPings = [];
      nDate.setDate(nDate.getDate() + 1);
      nDate.setHours(0, 0, 0, 0);
    }
    cDate = new Date();
    return content;
  } catch (e) {
    console.log(e);
  }
};

const leetCodeStatsLive = async (client) => {
  const channel = client.channels.cache.get("1038644053950087278"); // old value is 1041617974332756049
  const content = await contentGenerator(
    client.channels.cache.get("1038644053950087278") // old value is 1041717419460280341
  );
  if (content) {
    const msgRef = await channel.send(content).catch((err) => console.log(err));
    setInterval(async () => {
      const content = await contentGenerator(
        client.channels.cache.get("1038644053950087278") // old value is 1041717419460280341
      ).catch((err) => console.log(err));
      await msgRef.edit(content).catch((err) => console.log(err));
      console.log("All Stats Updated!");
    }, 600000);
  }
};

module.exports = leetCodeStatsLive;

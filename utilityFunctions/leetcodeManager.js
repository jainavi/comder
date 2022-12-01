const axios = require("axios");
const { bold } = require("discord.js");

const User = require("../models/User");
const { send } = require("./messageSend");

const leetcodeManager = (client = null) => {
  const leetcodeFetchUrl = "https://leetcode.com/graphql/";
  let liveStatsMsgRef;

  const fetch = async (userId) => {
    const query = `query userProblemsSolved {
        matchedUser(username: "${userId}") {
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                }
            }
        }
    }`;
    const result = await axios({
      url: leetcodeFetchUrl,
      method: "post",
      data: {
        query,
      },
    });

    return result.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
  };

  const ping = (userName, difficulty, quantity, channelId) => {
    const channel = client.channels.cache.get(channelId);
    send(
      channel,
      `**${quantity} ${difficulty}** Ques. nipat gaya hai **${userName}** se BC!`
    ).catch((err) => console.log(err));
  };

  const contentGenerator = async () => {
    let content = "";
    try {
      const userArr = await User.find({});
      userArr.forEach((user) => {
        const totalQ = user.leetCode.difficulty.total;
        const easyQ = user.leetCode.difficulty.easy;
        const mediumQ = user.leetCode.difficulty.medium;
        const hardQ = user.leetCode.difficulty.hard;
        const dailyQuestionArr = user.leetCode.questionsDaily;

        const userBlock = `${bold(
          user.nickName + ":"
        )}   \`t: ${totalQ}\`  \`e: ${easyQ}\`  \`m: ${mediumQ}\`  \`h: ${hardQ}\`\nToday:   \`t: +${
          dailyQuestionArr[0].quantity
        }\`  \`e: +${dailyQuestionArr[1].quantity}\`  \`m: +${
          dailyQuestionArr[2].quantity
        }\`  \`h: +${dailyQuestionArr[3].quantity}\`\n\n`;
        content += userBlock;
      });
    } catch (e) {
      console.log(e);
      throw new Error("Error occured while generating the content");
    }
    return content;
  };

  const leetcodeStatsLive = async () => {
    const channel = client.channels.cache.get("1038644053950087278"); // old value is 1041617974332756049

    contentGenerator()
      .then(async (content) => {
        if (!liveStatsMsgRef) {
          liveStatsMsgRef = await send(channel, content);
          return;
        }
        liveStatsMsgRef.edit(content);
      })
      .catch((err) => {
        console.log(err);
        console.log("Can't show live stats");
      });
  };

  return {
    fetch,
    leetcodeStatsLive,
    ping,
  };
};

module.exports = leetcodeManager;

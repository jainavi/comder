const User = require("../models/User");
const { fetchOne } = require("./fetchLeetcode");
const dayjs = require("dayjs");

const updateDatabase = async () => {
  User.find({})
    .then((usersArr) => {
      usersArr.forEach(async (user) => {
        const freshData = await fetchOne(user.leetCode.id); //Array
        const staleData = user.leetCode.difficulty; //Object
        const timeStamp = dayjs();

        if (staleData.easy !== freshData[1].count) {
          const newQuestionQuantity = freshData[1].count - staleData.easy;
          const newQuestion = {
            difficulty: "easy",
            quantity: newQuestionQuantity,
            timeStamp: timeStamp,
          };
          user.leetCode.difficulty.easy = freshData[1].count;
          user.leetCode.questions.push(newQuestion);
        }
        if (staleData.medium !== freshData[2].count) {
          const newQuestionQuantity = freshData[2].count - staleData.medium;
          const newQuestion = {
            difficulty: "medium",
            quantity: newQuestionQuantity,
            timeStamp: timeStamp,
          };
          user.leetCode.difficulty.medium = freshData[2].count;
          user.leetCode.questions.push(newQuestion);
        }
        if (staleData.hard !== freshData[3].count) {
          const newQuestionQuantity = freshData[3].count - staleData.hard;
          const newQuestion = {
            difficulty: "hard",
            quantity: newQuestionQuantity,
            timeStamp: timeStamp,
          };
          user.leetCode.difficulty.hard = freshData[3].count;
          user.leetCode.questions.push(newQuestion);
        }
        if (staleData.total != freshData[0].count) {
          user.leetCode.difficulty.total = freshData[0].count;
        }
        user.save().then(() => console.log("Users Updated Successfully!"));
      });
    })
    .catch((err) => console.log(err));
};
module.exports = updateDatabase;

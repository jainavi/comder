const axios = require("axios");

const url = "https://leetcode.com/graphql/";

const fetchAll = async (users) => {
  if (!users) {
    return;
  }

  const data = await fetch(users);
  console.log(data);
};

const fetchOne = async (userId) => {
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
    url,
    method: "post",
    data: {
      query,
    },
  });

  return result.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
};

module.exports = { fetchOne, fetchAll };

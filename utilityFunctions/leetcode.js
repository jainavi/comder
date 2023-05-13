const axios = require('axios');

const User = require('../models/User');

const leetcodeFetchUrl = 'https://leetcode.com/graphql/';

const fetchOne = async (discordId) => {
	const user = await User.findOne({ discordId }, 'leetCode.id');
	const userId = user.leetCode.id;

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
		method: 'post',
		data: {
			query,
		},
	});
	// [{ difficulty: All, count:}, { difficulty: Easy, count:}, { difficulty: Medium, count:}, { difficulty: Hard, count:}];
	return result.data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
};

const fetchAll = async () => {
	const userArr = await User.find({}, 'discordId');
	const userMap = new Map();

	for (let i = 0; i < userArr.length; i++) {
		const discordId = userArr[i].discordId;
		const userState = await fetchOne(discordId);
		userMap.set(discordId, userState);
	}

	return userMap;
};

// const ping = async (client, userName, difficulty, quantity, channelId) => {
// 	try {
// 		const channel = client.channels.cache.get(channelId);
// 		send(
// 			channel,
// 			`**${quantity} ${difficulty}** Ques. nipat gaya hai **${userName}** se BC!`
// 		);
// 	} catch (e) {
// 		// eslint-disable-next-line quotes
// 		console.log("Can't Ping!");
// 		console.log(e);
// 	}
// };

module.exports = { fetchOne, fetchAll };

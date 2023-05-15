const axios = require('axios');

const User = require('../models/User');

const leetcodeFetchUrl = 'https://leetcode.com/graphql/';

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
	const userArr = await User.find({}, ['discordId', 'leetCode.id']);
	const userMap = new Map();

	for (let i = 0; i < userArr.length; i++) {
		const discordId = userArr[i].discordId;
		const userState = await fetchOne(userArr[i].leetCode.id);
		userMap.set(discordId, userState);
	}

	return userMap;
};

module.exports = { name: 'leetCode', fetchOne, fetchAll };

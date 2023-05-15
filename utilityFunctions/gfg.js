const axios = require('axios');
const cheerio = require('cheerio');

const User = require('../models/User');

const gfgFetchUrl = 'https://auth.geeksforgeeks.org/user/';

const fetchOne = async (userId) => {
	const { data: sourceHtml } = await axios.get(gfgFetchUrl + userId);
	const $ = cheerio.load(sourceHtml);
	const statsString = $('.tab').next().next().text();
	const userStat = [
		{ difficulty: 'All', count: 0 },
		{ difficulty: 'Easy', count: 0 },
		{ difficulty: 'Medium', count: 0 },
		{ difficulty: 'Hard', count: 0 },
	];
	let idx = 1,
		allQuantity = 0;
	for (let i = 0; i < statsString.length; i++) {
		if (statsString.charAt(i) === '(') {
			let quantity = '';
			while (statsString.charAt(i + 1) !== ')') {
				quantity += statsString.charAt(++i);
			}
			quantity = parseInt(quantity);
			userStat[idx++].count += quantity;
			allQuantity += quantity;
		}
	}
	userStat[0].count = allQuantity;
	return userStat;
};

const fetchAll = async () => {
	const userArr = await User.find({}, ['discordId', 'gfg.id']);
	const userMap = new Map();

	for (let i = 0; i < userArr.length; i++) {
		const discordId = userArr[i].discordId;
		const userState = await fetchOne(userArr[i].gfg.id);
		userMap.set(discordId, userState);
	}
	return userMap;
};

module.exports = { name: 'gfg', fetchOne, fetchAll };

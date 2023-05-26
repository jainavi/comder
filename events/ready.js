const { Events } = require('discord.js');

const manager = require('../utilityFunctions/manager');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		manager.ping(client);
		manager.showDailyLeaderBoard(client);
		manager.weeklyStatsSummary(client);
	},
};

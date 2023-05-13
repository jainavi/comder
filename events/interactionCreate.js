const { Events } = require('discord.js');
const errorHandler = require('../utilityFunctions/errorHandler');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) {
			console.log(interaction);
			return;
		}

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			const error = new Error(
				`No command matching ${interaction.commandName} was found.`
			);
			errorHandler(error);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			errorHandler(error, () => {
				console.error(`Error executing ${interaction.commandName}`);
			});
		}
	},
};

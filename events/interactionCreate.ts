import { Events, Collection, CommandInteraction, ChatInputCommandInteraction, Snowflake } from 'discord.js';
const cooldowns = new Collection<string, Collection<string, number>>()

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing the command ${interaction.commandName}`);
			console.error(error);
			try {
				await interaction.reply({ content: 'Sorry, but there was an error while executing this command. Please try again later.', ephemeral: true });
			} catch(error) {
                try {
                    await interaction.editReply({ content: 'Sorry, but there was an error while executing this command. Please try again later.' });
                } catch(error) {
                    console.error(error)
                }
			}
		}
	},
};
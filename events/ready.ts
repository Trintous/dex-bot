import { Events, ActivityType, Client } from 'discord.js';

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		console.log(`Ready! Logged in as ${client.user!.tag}`);
        if(client.user) {
            client.user.setActivity(`pokémon`, { type: ActivityType.Watching });
            client.user.setStatus('idle');
        }
	},
};
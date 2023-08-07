import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import { config } from "dotenv";
import { SlashCommand } from './types';
config();

const commands: SlashCommand[] = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const { data } = require(`./commands/${file}`);
	commands.push(data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

(async () => {
    if(!process.env.CLIENT_ID) return console.error('No client ID in .env');
	try {
		console.log(`Started refreshing ${commands.length} global (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID!),
			{ body: commands },
		);
        console.log(`Refreshed ${commands.length} commands`)
	} catch (error) {
		console.error(error);
	}
})();
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from './types';
import dotenv from 'dotenv';
dotenv.config();

import { loadEvents } from './handlers/eventHandler';
import { loadCommands } from './handlers/commandHandler';

export class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
}
const client = new ExtendedClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,

    ],
});

async function start() {
    await loadEvents(client);
    await loadCommands(client);

    await client.login(process.env.DISCORD_TOKEN as string);
}
start().catch(console.error);

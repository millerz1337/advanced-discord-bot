import { ExtendedClient } from '../index';
import fs from 'fs';
import path from 'path';
import { Command } from '../types';

export const loadCommands = async (client: ExtendedClient) => {
    const commandsPath = path.join(__dirname, '../commands');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true });

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const rawCommand = (await import(filePath)).default;
        if ('data' in rawCommand && 'execute' in rawCommand) {
            const command: Command = rawCommand;
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.warn(`404: Command file ${filePath} is invalid.`);
        }
    }
};

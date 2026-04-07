import { Events } from 'discord.js';
import { Event } from '../types';
import { ExtendedClient } from '../index';

const event: Event<Events.ClientReady> = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const extClient = client as ExtendedClient;

        const commandsData = extClient.commands.map((cmd) => cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
        
        if (extClient.application) {
            try {
                await extClient.application.commands.set(commandsData);
            } catch (error) {
                console.error(error);
            }
        }
    },
};

export default event;

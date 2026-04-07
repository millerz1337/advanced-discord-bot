import { Events, Interaction } from 'discord.js';
import { Event } from '../types';
import { ExtendedClient } from '../index';

const event: Event<Events.InteractionCreate> = {
    name: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {
        const client = interaction.client as ExtendedClient;


        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                return;
            }
            try {
                await command.execute(interaction as any, client);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                } else {
                }
            }
        }
    },
};

export default event;

import { SlashCommandBuilder, CommandInteraction, ClientEvents, ChatInputCommandInteraction } from 'discord.js';
import { ExtendedClient } from './index';

export interface Command {
    data: SlashCommandBuilder | any;
    execute: (interaction: ChatInputCommandInteraction, client: ExtendedClient) => Promise<void>;
}
export interface Event<Key extends keyof ClientEvents> {
    name: Key;
    once?: boolean;
    execute: (...args: ClientEvents[Key]) => any;
}
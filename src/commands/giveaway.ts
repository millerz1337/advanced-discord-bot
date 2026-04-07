import { SlashCommandBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Starts a new giveaway.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {

        const modal = new ModalBuilder()
            .setCustomId('giveaway_create_modal')
            .setTitle('Start Giveaway');

        const prizeInput = new TextInputBuilder()
            .setCustomId('prizeInput')
            .setLabel('Giveaway Prize')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. 1 Month Nitro')
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('durationInput')
            .setLabel('Duration (e.g., 1m, 1d, 1w)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g. 1d')
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('winnersInput')
            .setLabel('Number of Winners')
            .setStyle(TextInputStyle.Short)
            .setValue('1')
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(prizeInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(winnersInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);
    },
};

export default command;

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sets up the support ticket panel in this channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder()
            .setTitle('Support Ticket')
            .setDescription('If you need help, you can create a support ticket by clicking the button below.')
            .setColor('#2b2d31');

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_create')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ content: 'Ticket panel successfully set up!', ephemeral: true });
        await (interaction.channel as TextChannel)?.send({ embeds: [embed], components: [row] });
    },
};

export default command;

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Deletes all messages in the channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.channel as TextChannel;

        if (!channel || channel.isThread() || !channel.clone) {
            await interaction.reply({ content: 'I cannot nuke this type of channel!', ephemeral: true });
            return;
        }

        try {
            const newChannel = await channel.clone();
            await newChannel.setPosition(channel.position);
            
            await channel.delete();

            const embed = new EmbedBuilder()
                .setTitle('Channel Nuked')
                .setDescription('All messages have been cleared.')
                .setColor('#2b2d31')
                .setTimestamp();

            const nukeMessage = await newChannel.send({ embeds: [embed] });
            setTimeout(() => nukeMessage.delete().catch(() => null), 5000);
        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while nuking the channel.', ephemeral: true });
            }
        }
    },
};

export default command;

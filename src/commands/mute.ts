import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import ms from 'ms';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('timeout to user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration (e.g., 10m, 1h, 1d, 1w)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const durationStr = interaction.options.getString('duration', true);
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        
        const member = interaction.guild?.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: 'This user was not found on the server!', ephemeral: true });
            return;
        }

        const durationMs = ms(durationStr as any) as unknown as number;
        
        if (!durationMs || durationMs < 10000 || durationMs > 2419200000) {
            await interaction.reply({ content: 'Please enter a valid duration (At least 10 seconds, at most 28 days). e.g., `10m`, `1h`, `1d`, `1w`', ephemeral: true });
            return;
        }

        if (!member.moderatable) {
            await interaction.reply({ content: 'I cannot mute this user! My permissions might be insufficient or they might have a higher role than me.', ephemeral: true });
            return;
        }

        try {
            await member.timeout(durationMs, reason);
            const embed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('User Muted')
                .setDescription(`**${user.tag}** has been successfully muted.`)
                .addFields(
                    { name: 'Duration', value: durationStr, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                );
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while muting the user.', ephemeral: true });
        }
    },
};

export default command;

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        
        const member = interaction.guild?.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: 'This user was not found on the server!', ephemeral: true });
            return;
        }

        if (!member.bannable) {
            await interaction.reply({ content: 'I cannot ban this user! My permissions might be insufficient or they might have a higher role than me.', ephemeral: true });
            return;
        }

        try {
            await member.ban({ reason });
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('User Banned')
                .setDescription(`**${user.tag}** has been banned from the server.\n**Reason:** ${reason}`);
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while banning the user.', ephemeral: true });
        }
    },
};

export default command;

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks the user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        
        const member = interaction.guild?.members.cache.get(user.id);
        if (!member) {
            await interaction.reply({ content: 'This user was not found on the server!', ephemeral: true });
            return;
        }

        if (!member.kickable) {
            await interaction.reply({ content: 'I cannot kick this user! My permissions might be insufficient or they might have a higher role than me.', ephemeral: true });
            return;
        }

        try {
            await member.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('User Kicked')
                .setDescription(`**${user.tag}** has been kicked from the server.\n**Reason:** ${reason}`);
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while kicking the user.', ephemeral: true });
        }
    },
};

export default command;

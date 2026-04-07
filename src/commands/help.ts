import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { ExtendedClient } from '../index';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists the commands of the bot.'),
    async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
        
        const commandsList = client.commands.map(cmd => `**/${cmd.data.name}**: ${cmd.data.description}`);

        const embed = new EmbedBuilder()
            .setTitle('Commands List')
            .setDescription('\n\n' + commandsList.join('\n'))
            .setColor('#5865f2')
            .setFooter({ 
                text: `Requested by ${interaction.user.tag}.`, 
                iconURL: interaction.user.displayAvatarURL() || undefined 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

export default command;

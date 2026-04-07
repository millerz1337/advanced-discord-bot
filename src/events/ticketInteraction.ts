import { Events, Interaction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Event } from '../types';

const event: Event<Events.InteractionCreate> = {
    name: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {

        if (interaction.isButton()) {
            if (interaction.customId === 'ticket_create') {
                const modal = new ModalBuilder()
                    .setCustomId('ticket_modal')
                    .setTitle('Create Support Ticket');

                const reasonInput = new TextInputBuilder()
                    .setCustomId('reasonInput')
                    .setLabel('What do you need support with?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setPlaceholder('Please explain your problem...')
                    .setRequired(true);

                const row = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
                modal.addComponents(row);

                await interaction.showModal(modal);
            }

            else if (interaction.customId === 'ticket_close') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                    await interaction.reply({ content: 'Only administrators can close tickets.', ephemeral: true });
                    return;
                }
                await interaction.reply({ content: 'Your ticket is closing, the channel will be deleted...', ephemeral: true });
                setTimeout(async () => {
                    await interaction.channel?.delete().catch(() => null);
                }, 4000);
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'ticket_modal') {
                await interaction.deferReply({ ephemeral: true });
                const reason = interaction.fields.getTextInputValue('reasonInput');

                const guild = interaction.guild;
                if (!guild) return;

                try {
                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${interaction.user.username}`,
                        type: ChannelType.GuildText,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: interaction.user.id,
                                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                            },
                        ],
                    });

                    const embed = new EmbedBuilder()
                        .setTitle('Support Ticket')
                        .setDescription(`Hello <@${interaction.user.id}>, your support ticket has been created.\n\n**Topic:** ${reason}\n\nAdmins will help you shortly.`)
                        .setColor('#00ffaa');

                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ticket_close')
                                .setLabel('Close Ticket')
                                .setStyle(ButtonStyle.Danger)
                        );

                    await ticketChannel.send({ embeds: [embed], components: [row] });
                    await interaction.editReply({ content: `Your support ticket has been successfully created! <#${ticketChannel.id}>` });

                } catch (error) {
                    console.error(error);
                    await interaction.editReply({ content: 'A permission error occurred while creating the channel.' });
                }
            }
        }
    },
};

export default event;

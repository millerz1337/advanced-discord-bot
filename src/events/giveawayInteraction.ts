import { Events, Interaction, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, TextChannel, PermissionFlagsBits } from 'discord.js';
import { Event } from '../types';
import ms from 'ms';

interface GiveawayData {
    prize: string;
    winnersCount: number;
    entries: Set<string>;
    timeout: NodeJS.Timeout | null;
    endTime: number;
}

const giveaways = new Map<string, GiveawayData>();

const event: Event<Events.InteractionCreate> = {
    name: Events.InteractionCreate,
    execute: async (interaction: Interaction) => {

        if (interaction.isButton()) {
            const giveaway = giveaways.get(interaction.message.id);

            if (interaction.customId === 'giveaway_join') {
                if (!giveaway) {
                    await interaction.reply({ content: 'This giveaway is no longer active.', ephemeral: true });
                    return;
                }

                if (giveaway.entries.has(interaction.user.id)) {
                    await interaction.reply({ content: 'You have already joined this giveaway!', ephemeral: true });
                    return;
                }

                giveaway.entries.add(interaction.user.id);
                const embed = EmbedBuilder.from(interaction.message.embeds[0]);
                embed.data.fields = embed.data.fields?.map(field => {
                    if (field.name === 'Participant Count' || field.name === 'Number of Participants') {
                        return { name: 'Participant Count', value: `${giveaway.entries.size}`, inline: true };
                    }
                    return field;
                });

                await interaction.update({ embeds: [embed] });
                await interaction.followUp({ content: 'You have successfully joined the giveaway!', ephemeral: true });
            }

            else if (interaction.customId === 'giveaway_end') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                    await interaction.reply({ content: 'Only administrators can end giveaways.', ephemeral: true });
                    return;
                }

                if (!giveaway || giveaway.timeout === null) {
                    await interaction.reply({ content: 'This giveaway has already ended.', ephemeral: true });
                    return;
                }

                clearTimeout(giveaway.timeout);
                giveaway.timeout = null;
                await finishGiveaway(interaction.message, giveaway);
                await interaction.reply({ content: 'Giveaway ended manually.', ephemeral: true });
            }

            else if (interaction.customId === 'giveaway_reroll') {
                if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                    await interaction.reply({ content: 'Only administrators can reroll winners.', ephemeral: true });
                    return;
                }

                if (!giveaway) {
                    await interaction.reply({ content: 'Giveaway data not found for reroll.', ephemeral: true });
                    return;
                }

                const participants = Array.from(giveaway.entries);
                if (participants.length === 0) {
                    await interaction.reply({ content: 'No participants to reroll from!', ephemeral: true });
                    return;
                }

                const winners: string[] = [];
                const tempParticipants = [...participants];
                for (let i = 0; i < Math.min(giveaway.winnersCount, tempParticipants.length); i++) {
                    const index = Math.floor(Math.random() * tempParticipants.length);
                    winners.push(tempParticipants[index]);
                    tempParticipants.splice(index, 1);
                }

                const channel = interaction.channel as TextChannel;
                if (channel) {
                    await channel.send(`New winner(s) for **${giveaway.prize}**: ${winners.map(id => `<@${id}>`).join(', ')} (Rerolled)`);
                }
                await interaction.reply({ content: 'Winners rerolled!', ephemeral: true });
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'giveaway_create_modal') {
                const prize = interaction.fields.getTextInputValue('prizeInput');
                const durationStr = interaction.fields.getTextInputValue('durationInput');
                let winnersCount = parseInt(interaction.fields.getTextInputValue('winnersInput'));

                if (isNaN(winnersCount) || winnersCount < 1) winnersCount = 1;
                
                const durationMs = ms(durationStr as any) as unknown as number;

                if (!durationMs || durationMs < 1000) {
                    await interaction.reply({ content: 'You entered an invalid duration! e.g., `10m`, `1h`, `1d`', ephemeral: true });
                    return;
                }

                await interaction.deferReply();

                const endTime = Math.floor((Date.now() + durationMs) / 1000);

                const embed = new EmbedBuilder()
                    .setTitle('Giveaway Started!')
                    .setDescription(`**Prize:** ${prize}\n**Ends:** <t:${endTime}:R> (<t:${endTime}:F>)`)
                    .setColor('#5865f2')
                    .addFields(
                        { name: 'Number of Winners', value: `${winnersCount}`, inline: true },
                        { name: 'Participant Count', value: '0', inline: true }
                    )
                    .setFooter({ text: 'You can join by clicking the button below!' });

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('giveaway_join')
                            .setLabel('Join!')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('giveaway_end')
                            .setLabel('End!')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('giveaway_reroll')
                            .setLabel('Reroll!')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const message = await interaction.editReply({ embeds: [embed], components: [row] });

                const giveawayData: GiveawayData = {
                    prize,
                    winnersCount,
                    entries: new Set<string>(),
                    endTime,
                    timeout: null
                };

                giveawayData.timeout = setTimeout(async () => {
                    const currentGiveaway = giveaways.get(message.id);
                    if (currentGiveaway) {
                        currentGiveaway.timeout = null;
                        await finishGiveaway(message, currentGiveaway);
                    }
                }, durationMs);

                giveaways.set(message.id, giveawayData);
            }
        }
    },
};

export async function finishGiveaway(message: any, giveaway: GiveawayData) {
    const participants = Array.from(giveaway.entries);
    let description = `**Prize:** ${giveaway.prize}\n\n`;

    if (participants.length === 0) {
        description += '**Result:** No one joined the giveaway!';
    } else {
        const winners: string[] = [];
        const tempParticipants = [...participants];
        for (let i = 0; i < Math.min(giveaway.winnersCount, tempParticipants.length); i++) {
            const index = Math.floor(Math.random() * tempParticipants.length);
            winners.push(tempParticipants[index]);
            tempParticipants.splice(index, 1);
        }
        
        description += `**Winner(s):** ${winners.map(id => `<@${id}>`).join(', ')}\n`;
        description += `\nCongratulations! You can contact administrators to claim your prize.`;

        const channel = message.channel as TextChannel;
        if (channel) {
            await channel.send(`Congratulations ${winners.map(id => `<@${id}>`).join(', ')}! You won the **${giveaway.prize}**!`);
        }
    }

    const endEmbed = new EmbedBuilder()
        .setTitle('Giveaway Ended!')
        .setDescription(description)
        .setColor('#3ba55d')
        .setFooter({ text: `${giveaway.entries.size} people participated.` });

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('giveaway_reroll')
                .setLabel('Reroll')
                .setStyle(ButtonStyle.Secondary)
        );

    await message.edit({ embeds: [endEmbed], components: [row] }).catch(() => null);
}

export { giveaways, GiveawayData };
export default event;

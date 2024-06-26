import { ButtonInteraction, Guild, GuildMember, ActionRowBuilder, ButtonBuilder, TextBasedChannel, ButtonStyle, MessageActionRowComponentBuilder } from "discord.js";
import { Localisation } from "../localisation";
import { createMessageEmbed } from "./Utils";

export async function waitForPlayers(maxPlayers: number, minPlayers: number, title: string, guild: Guild, channel: TextBasedChannel, author: GuildMember, startGame: (members: GuildMember[]) => void) {
    const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(new ButtonBuilder({ customId: "join", style: ButtonStyle.Primary, label: Localisation.getLocalisation("button.join") }));

    let remainingPlayers = maxPlayers;

    const embed = await createMessageEmbed({ description: Localisation.getLocalisation("generic.waitingplayers", remainingPlayers), title: Localisation.getLocalisation(title) }, guild);

    const message = await channel.send({ embeds: [embed], components: [buttons] });

    let deleted = false;

    const collector = message.createMessageComponentCollector({ filter: () => true, time: 10 * 60 * 1000 });

    const membersJoined = [];

    membersJoined.push(author);

    collector.on("end", async () => {
        if (deleted) return;
        await message.edit({ components: [] });
        if (membersJoined.length < 1) {
            embed.setDescription(Localisation.getLocalisation("generic.noonejoin"));
            message.edit({ embeds: [embed] });
        }
    });

    collector.on("collect", async (interaction: ButtonInteraction) => {
        if (interaction.customId === "join") {
            if (interaction.user.id === author.id) {
                await interaction.reply({ content: Localisation.getLocalisation("error.minigame.author"), ephemeral: true });
                return;
            }
            if (membersJoined.find((member) => member.id === interaction.user.id)) {
                await interaction.reply({ content: Localisation.getLocalisation("error.minigame.alreadyjoin"), ephemeral: true });
                return;
            }
            remainingPlayers--;
            membersJoined.push(interaction.member);
            if (remainingPlayers <= 0) {
                deleted = true;
                message.delete();
                startGame(membersJoined);
            } else {
                const newButtons = buttons;
                if (remainingPlayers <= minPlayers) {
                    newButtons.addComponents(new ButtonBuilder({ customId: "start", style: ButtonStyle.Primary, label: Localisation.getLocalisation("button.start") }));
                }
                embed.setDescription(Localisation.getLocalisation("generic.waitingplayers", remainingPlayers));
                await interaction.update({ embeds: [embed], components: [newButtons] });
            }
        } else if (interaction.customId === "start") {
            if (interaction.user.id !== author.id) {
                await interaction.reply({ content: Localisation.getLocalisation("error.minigame.notauthor"), ephemeral: true });
                return;
            }
            deleted = true;
            message.delete();
            startGame(membersJoined);
            collector.emit("end");
        }
    });
}
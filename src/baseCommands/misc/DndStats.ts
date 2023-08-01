import { EmbedBuilder } from "@discordjs/builders";
import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DndStats, getStat, setStat } from "../../structs/databaseTypes/DndStats";
import { getMemberFromMention } from "../../utils/GetterUtils";
import { createMessageEmbed, getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { SelectOption, createMessageSelection } from "../../utils/MessageSelectionUtils";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { ButtonStyle, TextInputStyle } from "discord.js";
import { getStringReply } from "../../utils/ReplyUtils";
import { Localisation } from "../../localisation";
import { ModalFieldData, createInteractionModal } from "../../utils/InteractionModalUtils";

export class DndStatsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        let member = cmdArgs.member;

        if (cmdArgs.args.length > 0) {
            const temp = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
            if (!temp) {
                cmdArgs.reply("Couldnt find a member by that id");
                return;
            }
            member = temp;
        }

        const Stats = BotUser.getDatabase(DatabaseType.DndStats);
        const stats: DndStats[] = await getServerDatabase(Stats, cmdArgs.guildId);

        let userStat = stats.find(s => s.userId == member.id);

        if (!userStat && member !== cmdArgs.member) {
            cmdArgs.reply("That member doesnt have any stats");
            return;
        }

        if (!userStat) {
            userStat = new DndStats(member.id, 0, 0, 0, 0, 0, 0);
            stats.push(userStat);
            Stats.set(cmdArgs.guildId, stats);
        }

        const embed = await createMessageEmbed(new EmbedBuilder(), cmdArgs.guild);

        embed.setTitle(member.nickname ?? member.user.username);

        const titles = ["Agility", "Charisma", "Intelligence", "Luck", "Magic", "Strength"];

        for (let index = 0; index < 6; index++) {
            const element = getStat(userStat, index);
            embed.addFields({
                name: titles[index],
                value: element.toString(),
                inline: true
            });
        }

        if (member === cmdArgs.member) {
            /*createMessageButtons({
                sendTarget: cmdArgs.body,
                author: cmdArgs.author,
                options: { embeds: [embed] },
                buttons: [
                    {
                        customId: "edit",
                        label: "Edit",
                        style: ButtonStyle.Primary,
                        onRun: async ({ interaction }) => {
                            const fields: Partial<ModalFieldData>[] = [];

                            for (let index = 0; index < 6; index++) {
                                const element = getStat(userStat, index);

                                const title = titles[index];

                                fields.push({
                                    custom_id: title,
                                    label: title,
                                    max_length: 2,
                                    required: true,
                                    value: element.toString(),
                                    style: TextInputStyle.Short
                                });
                            }

                            await createInteractionModal({
                                title: "Stats Part 1",
                                sendTarget: interaction,
                                fields: fields.splice(0, 3),
                                onSubmit: async ({ data, interaction: submission }) => {
                                    await createInteractionModal({
                                        title: "Stats Part 2",
                                        sendTarget: interaction,
                                        fields: fields.splice(3, fields.length),
                                        onSubmit: async ({ data, interaction: submission }) => {
                                            submission.reply(Localisation.getTranslation("generic.done"));
                                        },
                                        filter: ({ data, interaction: submission }) => {
                                            return true;
                                        }
                                    });
                                },
                                filter: ({ data, interaction: submission }) => {
                                    return true;
                                }
                            });
                        }
                    }
                ]
            });*/
            createMessageButtons({
                sendTarget: cmdArgs.body,
                author: cmdArgs.author,
                options: { embeds: [embed] },
                buttons: [
                    {
                        customId: "editSingle",
                        label: "Edit Single",
                        style: ButtonStyle.Primary,
                        onRun: async ({ interaction }) => {
                            const options: SelectOption[] = [];

                            for (let index = 0; index < 6; index++) {
                                const element = getStat(userStat, index);

                                const title = titles[index];

                                options.push({
                                    label: title,
                                    description: null,
                                    default: false,
                                    emoji: null,
                                    value: index.toString(),
                                    async onSelect({ interaction }) {
                                        const options: SelectOption[] = [];

                                        for (let jndex = 0; jndex <= 10; jndex++) {
                                            options.push({
                                                emoji: null,
                                                description: null,
                                                default: false,
                                                value: jndex.toString(),
                                                label: jndex.toString(),
                                                async onSelect({ interaction }) {
                                                    setStat(userStat, index, jndex);

                                                    Stats.set(cmdArgs.guildId, stats);

                                                    return interaction.reply({ content: `New value for ${title} is ${jndex}` });
                                                }
                                            });
                                        }

                                        const embed = await createMessageEmbed(new EmbedBuilder(), cmdArgs.guild);

                                        embed.setTitle(title);
                                        embed.setDescription(`Current Value: ${element}`);

                                        createMessageSelection({
                                            sendTarget: interaction,
                                            author: cmdArgs.author,
                                            options: { embeds: [embed] },
                                            settings: { max: 1 },
                                            selectMenuOptions: { options }
                                        });
                                    },
                                });
                            }

                            createMessageSelection({
                                sendTarget: interaction,
                                author: cmdArgs.author,
                                options: "Edit Stats",
                                settings: { max: 1 },
                                selectMenuOptions: { options }
                            });
                        }
                    },
                    {
                        customId: "editMultple",
                        label: "Edit Multiple",
                        style: ButtonStyle.Primary,
                        async onRun({ interaction }) {
                            const { value: reply, message } = await getStringReply({
                                author: cmdArgs.author, sendTarget: interaction, settings: { max: 1 },
                                options: "Reply with the stats, in the range of 0 to 10, separated by a comma, in the order, (Agility, Charisma, Intelligence, Luck, Magic, Strength). Example: 5,7,2,8,5,1"
                            });
                            if (reply === undefined) return;

                            const separated = reply.split(',');

                            if (separated.length < 6) {
                                message.reply("You didn't write all the different stats");
                                return;
                            }

                            for (let index = 0; index < 6; index++) {
                                const element = separated[index];
                                const num = parseInt(element.trim());
                                if (isNaN(num) || num < 0 || num > 10)
                                    return message.reply(Localisation.getTranslation("error.invalid.number"));

                                setStat(userStat, index, num);
                            }

                            Stats.set(cmdArgs.guildId, stats);
                            message.reply(Localisation.getTranslation("generic.done"));
                        },
                    }
                ], settings: { max: 1 }
            });
        } else {
            cmdArgs.reply({ embeds: [embed] });
        }
    }
}
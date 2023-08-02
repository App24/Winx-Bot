import { EmbedBuilder } from "discord.js";
import { Localisation } from "../../localisation";
import { getTextChannelById, getThreadChannelById, getTextChannelFromMention, getBotRoleColor } from "../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { asyncForEach, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ServerData } from "../../structs/databaseTypes/ServerData";

export class ExcludeChannelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "add",
                        onSelect: async ({ interaction }) => {
                            const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!channel) return;

                            if (serverInfo.excludeChannels.find(c => c === channel.id)) return msg.reply(Localisation.getTranslation("excludechannel.channel.already"));

                            serverInfo.excludeChannels.push(channel.id);

                            await serverInfo.save();

                            msg.reply(Localisation.getTranslation("excludechannel.add", channel));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "remove",
                        onSelect: async ({ interaction }) => {
                            await interaction.deferReply();
                            if (!serverInfo.excludeChannels.length) return interaction.editReply(Localisation.getTranslation("error.empty.excludedchannels"));

                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "-1",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                },
                                default: false,
                                description: null,
                                emoji: null
                            });

                            await asyncForEach(serverInfo.excludeChannels, async (excludedChannel, index) => {
                                const channel = await getTextChannelById(excludedChannel, cmdArgs.guild);
                                if (!channel) return;
                                options.push({
                                    label: channel.name,
                                    value: index.toString(),
                                    onSelect: async ({ interaction }) => {
                                        serverInfo.excludeChannels.splice(index, 1);

                                        await serverInfo.save();

                                        interaction.reply(Localisation.getTranslation("excludechannel.remove", channel));
                                    },
                                    default: false,
                                    description: null,
                                    emoji: null
                                });
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                    options
                                }
                            });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.cleardeletedchannels"),
                        value: "clear",
                        onSelect: async ({ interaction }) => {
                            await interaction.deferReply();
                            await asyncForEach(serverInfo.excludeChannels, async (excludedChannel, index) => {
                                const channel = await getThreadChannelById(excludedChannel, cmdArgs.guild);
                                if (!channel) {
                                    serverInfo.excludeChannels.splice(index, 1);
                                }
                            });
                            await serverInfo.save();
                            interaction.editReply(Localisation.getTranslation("excludechannel.clear"));
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {
                            await interaction.deferReply();
                            const data = [];
                            await asyncForEach(serverInfo.excludeChannels, async (excludedChannel) => {
                                const channel = await getTextChannelFromMention(excludedChannel, cmdArgs.guild);
                                if (channel) {
                                    data.push(channel);
                                }
                            });
                            const embed = new EmbedBuilder();
                            embed.setDescription(data.join("\n"));
                            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                            interaction.editReply({ embeds: [embed] });
                        },
                        default: false,
                        description: null,
                        emoji: null
                    }
                ]
            }
        });
    }
}
import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { getBotRoleColor, getTextChannelById, getTextChannelFromMention, getThreadChannelById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase, asyncForEach } from "../../utils/Utils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";

class ExcludeChannelCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options: [
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "add",
                        onSelect: async ({ interaction }) => {
                            const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!channel) return;

                            if (serverInfo.excludeChannels.find(c => c === channel.id)) return msg.reply(Localisation.getTranslation("excludechannel.channel.already"));

                            serverInfo.excludeChannels.push(channel.id);

                            await ServerInfo.set(cmdArgs.guildId, serverInfo);
                            msg.reply(Localisation.getTranslation("excludechannel.add", channel));
                        }
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
                                }
                            });

                            await asyncForEach(serverInfo.excludeChannels, async (excludedChannel, index) => {
                                const channel = await getTextChannelById(excludedChannel, cmdArgs.guild);
                                if (!channel) return;
                                options.push({
                                    label: channel.name,
                                    value: index.toString(),
                                    onSelect: async ({ interaction }) => {
                                        serverInfo.excludeChannels.splice(index, 1);

                                        await ServerInfo.set(cmdArgs.guildId, serverInfo);
                                        interaction.reply(Localisation.getTranslation("excludechannel.remove", channel));
                                    }
                                });
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                    options
                                }
                            });
                        }
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
                            await ServerInfo.set(cmdArgs.guildId, serverInfo);
                            interaction.editReply(Localisation.getTranslation("excludechannel.clear"));
                        }
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
                            const embed = new MessageEmbed();
                            embed.setDescription(data.join("\n"));
                            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                            interaction.editReply({ embeds: [embed] });
                        }
                    }
                ]
            }
        });
    }
}

export = ExcludeChannelCommand;
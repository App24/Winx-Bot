import { MessageEmbed } from "discord.js";
import { BotUser } from "../../../BotClient";
import { getRoleFromMention, getBotRoleColor } from "../../../utils/GetterUtils";
import { Localisation } from "../../../localisation";
import { Settings } from "../../../structs/Category";
import { Command, CommandAvailable, CommandAccess, CommandArguments } from "../../../structs/Command";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { getServerDatabase, asyncForEach, getReplyLevel } from "../../../utils/Utils";
import { createMessageButtons } from "../../../utils/MessageButtonUtils";
import { createMessageCollector } from "../../../utils/MessageUtils";
import { createMessageSelection } from "../../../utils/MessageSelectionUtils";

class ManageRanksCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);

        await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                onSelection: async ({ interaction }) => {
                    await interaction.deferUpdate();
                },
                options: [
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "add",
                        onSelect: async ({ interaction }) => {
                            getReplyLevel(cmdArgs.message, cmdArgs.author, "argument.reply.level").then(async ({ value: level, message }) => {
                                if (level === undefined || level < 0) return;

                                let rankLevel = ranks.find(rank => rank.level === level);

                                const reply = await message.reply(Localisation.getTranslation("argument.reply.role"));
                                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                    const role = await getRoleFromMention(msg.content, cmdArgs.guild);
                                    if (!role) return <any>msg.reply(Localisation.getTranslation("error.invalid.role"));
                                    if (rankLevel) {
                                        const index = ranks.findIndex(rank => rank.level === rankLevel.level);
                                        rankLevel.level = level;
                                        rankLevel.roleId = role.id;
                                        ranks.splice(index, 1);
                                    } else {
                                        rankLevel = new RankLevel(level, role.id);
                                    }
                                    ranks.push(rankLevel);
                                    await Ranks.set(cmdArgs.guildId, ranks);
                                    return interaction.followUp(Localisation.getTranslation("setrank.role.set"));
                                });
                            });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "remove",
                        onSelect: async () => {
                            getReplyLevel(cmdArgs.message, cmdArgs.author, "argument.reply.level").then(async ({ value: level, message }) => {
                                if (level === undefined || level < 0) return;

                                const rankLevelIndex = ranks.findIndex(rank => rank.level === level);
                                if (rankLevelIndex < 0) return message.reply(Localisation.getTranslation("error.missing.rank"));

                                await createMessageButtons({
                                    sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getTranslation("generic.confirmation"), buttons: [
                                        {
                                            customId: "accept",
                                            style: "PRIMARY",
                                            label: Localisation.getTranslation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                ranks.splice(rankLevelIndex, 1);
                                                await Ranks.set(cmdArgs.guildId, ranks);
                                                interaction.reply(Localisation.getTranslation("setrank.role.remove"));
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            style: "DANGER",
                                            label: Localisation.getTranslation("button.cancel"),
                                            onRun: async ({ interaction }) => {
                                                await interaction.deferUpdate();
                                            }
                                        }
                                    ]
                                });
                            });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.list"),
                        value: "list",
                        onSelect: async ({ interaction }) => {
                            if (!ranks || !ranks.length) {
                                return interaction.followUp(Localisation.getTranslation("error.empty.ranks"));
                            }

                            ranks.sort((a, b) => a.level - b.level);
                            const data = [];
                            await asyncForEach(ranks, async (rank: RankLevel) => {
                                data.push(Localisation.getTranslation("transformations.list", rank.level, `<@&${rank.roleId}>`));
                            });

                            const embed = new MessageEmbed();
                            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                            embed.setDescription(data.join("\n"));
                            await interaction.followUp({ embeds: [embed] });
                        }
                    }
                ]
            }
        });

    }
}

export = ManageRanksCommand;
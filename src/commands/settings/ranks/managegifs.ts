import { BotUser } from "../../../BotClient";
import { Localisation } from "../../../localisation";
import { Settings } from "../../../structs/Category";
import { Command, CommandArguments } from "../../../structs/Command";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { CommandAccess } from "../../../structs/CommandAccess";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getRank, getRankRoles } from "../../../utils/RankUtils";
import { getServerDatabase } from "../../../utils/Utils";
import { capitalise } from "../../../utils/FormatUtils";
import { getStringReply } from "../../../utils/ReplyUtils";

class ManageGifsCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
    }

    public async onRun(cmdArgs: CommandArguments) {
        await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                onSelection: async ({ interaction }) => {
                    await interaction.deferUpdate();
                },
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            const rankRoles = await getRankRoles(cmdArgs.guild);
                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "cancel",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                }
                            });

                            rankRoles.forEach(rankRole => {
                                options.push({
                                    label: capitalise(rankRole.role.name),
                                    value: rankRole.role.name,
                                    onSelect: async ({ interaction }) => {
                                        const gifs = await this.getLevelGifs(rankRole.rank.level, cmdArgs.guildId);
                                        if (!gifs || gifs.length <= 0) {
                                            return interaction.reply(Localisation.getTranslation("error.missing.gifs"));
                                        }

                                        const options: SelectOption[] = [];

                                        options.push({
                                            label: Localisation.getTranslation("button.cancel"),
                                            value: "-1",
                                            onSelect: async ({ interaction }) => {
                                                interaction.deferUpdate();
                                            }
                                        });

                                        gifs.forEach((gif, i) => {
                                            options.push({
                                                label: gif,
                                                value: i.toString(),
                                                onSelect: async ({ interaction }) => {
                                                    interaction.reply(gif);
                                                }
                                            });
                                        });

                                        createMessageSelection({
                                            sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                            {
                                                options
                                            }
                                        });
                                    }
                                });
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                    options
                                }
                            });

                            /*const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.message, author: cmdArgs.author, options: Localisation.getTranslation("argument.reply.level") });
                            if (level === undefined || level < 0) return;
                            const gifs = await this.getLevelGifs(level, cmdArgs.guildId);
                            if (!gifs || gifs.length <= 0) {
                                return interaction.followUp(Localisation.getTranslation("error.missing.gifs"));
                            }

                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "-1",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                }
                            });

                            gifs.forEach((gif, i) => {
                                options.push({
                                    label: gif,
                                    value: i.toString(),
                                    onSelect: async ({ interaction }) => {
                                        interaction.reply(gif);
                                    }
                                });
                            });

                            createMessageSelection({
                                sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                {
                                    options
                                }
                            });*/
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            const rankRoles = await getRankRoles(cmdArgs.guild);
                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "cancel",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                }
                            });

                            rankRoles.forEach(rankRole => {
                                options.push({
                                    label: capitalise(rankRole.role.name),
                                    value: rankRole.role.name,
                                    onSelect: async ({ interaction }) => {
                                        const gifs = await this.getLevelGifs(rankRole.rank.level, cmdArgs.guildId);
                                        if (!gifs || gifs.length <= 0) {
                                            return interaction.reply(Localisation.getTranslation("error.missing.gifs"));
                                        }

                                        const rankLevel = rankRole.rank;

                                        const { value: gif } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "argument.reply.gif" });
                                        if (gif === undefined) return;

                                        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
                                        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
                                        const index = ranks.findIndex(r => r.level === rankLevel.level);
                                        if (index >= 0) {
                                            rankLevel.gifs.push(gif);
                                            ranks[index] = rankLevel;
                                        }
                                        interaction.followUp(Localisation.getTranslation("setrank.gifs.add"));
                                        await Ranks.set(cmdArgs.guildId, ranks);
                                    }
                                });
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                    options
                                }
                            });

                            /*const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.message, author: cmdArgs.author, options: Localisation.getTranslation("argument.reply.level") });
                            if (level === undefined || level < 0) return;
                            const rankLevel = await getRank(level, cmdArgs.guildId);

                            const { value: gif } = await getStringReply({ sendTarget: message, author: cmdArgs.author, options: "argument.reply.gif" });
                            if (gif === undefined) return;

                            const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
                            const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
                            const index = ranks.findIndex(r => r.level === rankLevel.level);
                            if (index >= 0) {
                                rankLevel.gifs.push(gif);
                                ranks[index] = rankLevel;
                            }
                            interaction.followUp(Localisation.getTranslation("setrank.gifs.add"));
                            await Ranks.set(cmdArgs.guildId, ranks);*/
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "delete",
                        onSelect: async ({ interaction }) => {
                            const rankRoles = await getRankRoles(cmdArgs.guild);
                            const options: SelectOption[] = [];

                            options.push({
                                label: "Cancel",
                                value: "cancel",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                }
                            });

                            rankRoles.forEach(rankRole => {
                                options.push({
                                    label: capitalise(rankRole.role.name),
                                    value: rankRole.role.name,
                                    onSelect: async ({ interaction }) => {
                                        const gifs = await this.getLevelGifs(rankRole.rank.level, cmdArgs.guildId);
                                        if (!gifs || gifs.length <= 0) {
                                            return interaction.reply(Localisation.getTranslation("error.missing.gifs"));
                                        }

                                        const rankLevel = rankRole.rank;

                                        const options: SelectOption[] = [];

                                        options.push({
                                            label: Localisation.getTranslation("button.cancel"),
                                            value: "-1",
                                            onSelect: async ({ interaction }) => {
                                                interaction.deferUpdate();
                                            }
                                        });

                                        gifs.forEach((gif, i) => {
                                            options.push({
                                                label: gif,
                                                value: i.toString(),
                                                onSelect: async ({ interaction }) => {
                                                    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
                                                    const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
                                                    const index = ranks.findIndex(r => r.level === rankLevel.level);
                                                    if (index >= 0) {
                                                        rankLevel.gifs.splice(i, 1);
                                                        ranks[index] = rankLevel;
                                                    }
                                                    await Ranks.set(cmdArgs.guildId, ranks);
                                                    interaction.reply(Localisation.getTranslation("setrank.gifs.remove"));
                                                }
                                            });
                                        });

                                        createMessageSelection({
                                            sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                            {
                                                options
                                            }
                                        });
                                    }
                                });
                            });

                            createMessageSelection({
                                sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                    options
                                }
                            });
                            /*const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.message, author: cmdArgs.author, options: Localisation.getTranslation("argument.reply.level") });
                            if (level === undefined || level < 0) return;
                            const gifs = await this.getLevelGifs(level, cmdArgs.guildId);
                            if (!gifs || gifs.length <= 0) {
                                return interaction.followUp(Localisation.getTranslation("error.missing.gifs"));
                            }
                            const rankLevel = await getRank(level, cmdArgs.guildId);

                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "-1",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                }
                            });

                            gifs.forEach((gif, i) => {
                                options.push({
                                    label: gif,
                                    value: i.toString(),
                                    onSelect: async ({ interaction }) => {
                                        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
                                        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
                                        const index = ranks.findIndex(r => r.level === rankLevel.level);
                                        if (index >= 0) {
                                            rankLevel.gifs.splice(i, 1);
                                            ranks[index] = rankLevel;
                                        }
                                        await Ranks.set(cmdArgs.guildId, ranks);
                                        interaction.reply(Localisation.getTranslation("setrank.gifs.remove"));
                                    }
                                });
                            });

                            createMessageSelection({
                                sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                {
                                    options
                                }
                            });*/
                        }
                    }
                ]
            }
        });
    }

    async getLevelGifs(level: number, guildId: string) {
        const rank = await getRank(level, guildId);
        if (!rank || !rank.gifs)
            return [];
        return rank.gifs;
    }
}

export = ManageGifsCommand;
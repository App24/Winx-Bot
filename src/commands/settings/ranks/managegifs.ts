import { BotUser } from "../../../BotClient";
import { Localisation } from "../../../localisation";
import { Settings } from "../../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailable } from "../../../structs/Command";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getRank } from "../../../utils/RankUtils";
import { getReplyLevel, getServerDatabase, getStringReply } from "../../../utils/Utils";

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
                            getReplyLevel(cmdArgs.message, cmdArgs.author, "argument.reply.level").then(async ({ value: level, message }) => {
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
                                });
                            });

                        }
                    },
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            getReplyLevel(cmdArgs.message, cmdArgs.author, "argument.reply.level").then(async ({ value: level, message }) => {
                                if (level === undefined || level < 0) return;
                                const gifs = await this.getLevelGifs(level, cmdArgs.guildId);
                                if (gifs.length > 15) {
                                    return interaction.followUp(Localisation.getTranslation("error.full.gifs"));
                                }
                                const rankLevel = await getRank(level, cmdArgs.guildId);

                                getStringReply(message, cmdArgs.author, "argument.reply.gif").then(async ({ value: gif }) => {
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
                                });
                            });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "delete",
                        onSelect: async ({ interaction }) => {
                            getReplyLevel(cmdArgs.message, cmdArgs.author, "argument.reply.level").then(async ({ value: level, message }) => {
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
                                });
                            });
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
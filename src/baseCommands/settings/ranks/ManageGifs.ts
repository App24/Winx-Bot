import { Localisation } from "../../../localisation";
import { RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { capitalise } from "../../../utils/FormatUtils";
import { getRoleById } from "../../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getRank } from "../../../utils/RankUtils";
import { getStringReply } from "../../../utils/ReplyUtils";
import { asyncForEach, getDatabase } from "../../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";

export class ManageGifsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        await createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                onSelection: async ({ interaction }) => {
                    await interaction.deferUpdate();
                },
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            const rankRoles = await getDatabase(RankLevel, { guild: cmdArgs.guild });
                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "cancel",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                },
                                default: false,
                                description: null,
                                emoji: null
                            });

                            await asyncForEach(rankRoles, async (rankRole) => {
                                const role = await getRoleById(rankRole.document.roleId, cmdArgs.guild);

                                options.push({
                                    label: capitalise(role.name),
                                    value: role.name,
                                    onSelect: async ({ interaction }) => {
                                        const gifs = await this.getLevelGifs(rankRole.document.level, cmdArgs.guildId);
                                        if (!gifs || gifs.length <= 0) {
                                            return interaction.reply(Localisation.getTranslation("error.missing.gifs"));
                                        }

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

                                        gifs.forEach((gif, i) => {
                                            options.push({
                                                label: gif,
                                                value: i.toString(),
                                                onSelect: async ({ interaction }) => {
                                                    interaction.reply(gif);
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            });
                                        });

                                        createMessageSelection({
                                            sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                            {
                                                options
                                            }
                                        });
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
                        label: Localisation.getTranslation("button.add"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            const rankRoles = await getDatabase(RankLevel, { guildId: cmdArgs.guildId });
                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "cancel",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                },
                                default: false,
                                description: null,
                                emoji: null
                            });

                            await asyncForEach(rankRoles, async (rankRole) => {
                                const role = await getRoleById(rankRole.document.roleId, cmdArgs.guild);

                                options.push({
                                    label: capitalise(role.name),
                                    value: role.name,
                                    onSelect: async ({ interaction }) => {
                                        const rankLevel = rankRole;

                                        const { value: gif } = await getStringReply({ sendTarget: interaction, author: cmdArgs.author, options: "argument.reply.gif" });
                                        if (gif === undefined) return;

                                        rankLevel.document.gifs.push(gif);
                                        await rankLevel.save();
                                        interaction.followUp(Localisation.getTranslation("setrank.gifs.add"));
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
                        label: Localisation.getTranslation("button.remove"),
                        value: "delete",
                        onSelect: async ({ interaction }) => {
                            const rankRoles = await getDatabase(RankLevel, { guildId: cmdArgs.guildId });
                            const options: SelectOption[] = [];

                            options.push({
                                label: "Cancel",
                                value: "cancel",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                },
                                default: false,
                                description: null,
                                emoji: null
                            });

                            await asyncForEach(rankRoles, async (rankRole) => {
                                const role = await getRoleById(rankRole.document.roleId, cmdArgs.guild);

                                options.push({
                                    label: capitalise(role.name),
                                    value: role.name,
                                    onSelect: async ({ interaction }) => {
                                        const gifs = await this.getLevelGifs(rankRole.document.level, cmdArgs.guildId);
                                        if (!gifs || gifs.length <= 0) {
                                            return interaction.reply(Localisation.getTranslation("error.missing.gifs"));
                                        }

                                        const rankLevel = rankRole;

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

                                        gifs.forEach((gif, i) => {
                                            options.push({
                                                label: gif,
                                                value: i.toString(),
                                                onSelect: async ({ interaction }) => {
                                                    rankLevel.document.gifs.splice(i, 1);
                                                    await rankLevel.save();
                                                    interaction.reply(Localisation.getTranslation("setrank.gifs.remove"));
                                                },
                                                default: false,
                                                description: null,
                                                emoji: null
                                            });
                                        });

                                        createMessageSelection({
                                            sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                            {
                                                options
                                            }
                                        });
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
                    }
                ]
            }
        });
    }

    async getLevelGifs(level: number, guildId: string) {
        const rank = await getRank(level, guildId);
        if (rank.isNull() || !rank.document.gifs)
            return [];
        return rank.document.gifs;
    }
}
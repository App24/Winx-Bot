import { ButtonStyle, EmbedBuilder } from "discord.js";
import { rmSync } from "fs";
import { BotUser } from "../../../BotClient";
import { WINGS_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { capitalise } from "../../../utils/FormatUtils";
import { getBotRoleColor } from "../../../utils/GetterUtils";
import { createMessageButtons } from "../../../utils/MessageButtonUtils";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getRankRoles } from "../../../utils/RankUtils";
import { getLevelReply, getRoleReply } from "../../../utils/ReplyUtils";
import { getServerDatabase, asyncForEach } from "../../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";

export class ManageRanksBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);

        await createMessageSelection({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                onSelection: async ({ interaction }) => {
                    await interaction.deferUpdate();
                },
                options: [
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "add",
                        onSelect: async ({ interaction }) => {
                            const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.body, author: cmdArgs.author });
                            if (level === undefined || level < 0) return;

                            let rankLevel = ranks.find(rank => rank.level === level);

                            const { value: role } = await getRoleReply({ sendTarget: message, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!role) return;
                            if (rankLevel) {
                                rmSync(`${WINGS_FOLDER}/${cmdArgs.guildId}/${level}`, { recursive: true, force: true });
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
                        },
                        default: false,
                        description: null,
                        emoji: null
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "remove",
                        onSelect: async () => {
                            const rankRoles = await getRankRoles(cmdArgs.guild);
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

                            rankRoles.forEach(rankRole => {
                                options.push({
                                    label: capitalise(rankRole.role.name),
                                    value: rankRole.role.name,
                                    onSelect: async ({ interaction }) => {
                                        const rankLevelIndex = ranks.findIndex(rank => rank.level === rankRole.rank.level);
                                        if (rankLevelIndex < 0) return interaction.reply(Localisation.getTranslation("error.missing.rank"));

                                        createMessageButtons({
                                            sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getTranslation("generic.confirmation"), buttons: [
                                                {
                                                    customId: "accept",
                                                    style: ButtonStyle.Primary,
                                                    label: Localisation.getTranslation("button.accept"),
                                                    onRun: async ({ interaction }) => {
                                                        rmSync(`${WINGS_FOLDER}/${cmdArgs.guildId}/${rankRole.rank.level}`, { recursive: true, force: true });
                                                        ranks.splice(rankLevelIndex, 1);
                                                        await Ranks.set(cmdArgs.guildId, ranks);
                                                        interaction.reply(Localisation.getTranslation("setrank.role.remove"));
                                                    }
                                                },
                                                {
                                                    customId: "cancel",
                                                    style: ButtonStyle.Danger,
                                                    label: Localisation.getTranslation("button.cancel"),
                                                    onRun: async ({ interaction }) => {
                                                        await interaction.deferUpdate();
                                                    }
                                                }
                                            ]
                                        });
                                    },
                                    default: false,
                                    description: null,
                                    emoji: null
                                });
                            });

                            createMessageSelection({
                                sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                                    options
                                }
                            });
                        },
                        default: false,
                        description: null,
                        emoji: null
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

                            const embed = new EmbedBuilder();
                            embed.setColor((await getBotRoleColor(cmdArgs.guild)));
                            embed.setDescription(data.join("\n"));
                            await interaction.followUp({ embeds: [embed] });
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
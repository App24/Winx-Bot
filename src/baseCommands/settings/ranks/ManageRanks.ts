import { ButtonStyle, EmbedBuilder } from "discord.js";
import { rmSync } from "fs";
import { WINGS_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { capitalise } from "../../../utils/FormatUtils";
import { getBotRoleColor, getRoleById } from "../../../utils/GetterUtils";
import { createMessageButtons } from "../../../utils/MessageButtonUtils";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getLevelReply, getRoleReply } from "../../../utils/ReplyUtils";
import { asyncForEach, getDatabase, getOneDatabase } from "../../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";

export class ManageRanksBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
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


                            const { value: role } = await getRoleReply({ sendTarget: message, author: cmdArgs.author, guild: cmdArgs.guild });
                            if (!role) return;

                            const rankLevel = await getOneDatabase(RankLevel, { guildId: cmdArgs.guildId, level }, () => new RankLevel({ guildId: cmdArgs.guildId, level, roleId: role.id }));

                            if (rankLevel) {
                                rmSync(`${WINGS_FOLDER}/${cmdArgs.guildId}/${level}`, { recursive: true, force: true });
                                rankLevel.level = level;
                                rankLevel.roleId = role.id;
                            }
                            await rankLevel.save();
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

                            await asyncForEach(rankRoles, (async (rankRole) => {
                                const role = await getRoleById(rankRole.roleId, cmdArgs.guild);
                                options.push({
                                    label: capitalise(role.name),
                                    value: role.name,
                                    onSelect: async ({ interaction }) => {
                                        createMessageButtons({
                                            sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getTranslation("generic.confirmation"), buttons: [
                                                {
                                                    customId: "accept",
                                                    style: ButtonStyle.Primary,
                                                    label: Localisation.getTranslation("button.accept"),
                                                    onRun: async ({ interaction }) => {
                                                        rmSync(`${WINGS_FOLDER}/${cmdArgs.guildId}/${rankRole.level}`, { recursive: true, force: true });
                                                        await RankLevel.deleteOne({ guildId: cmdArgs.guildId, level: rankRole.level });
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
                            }));

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
                            const ranks = await getDatabase(RankLevel, { guildId: cmdArgs.guildId });
                            if (!ranks || !ranks.length) {
                                return interaction.followUp(Localisation.getTranslation("error.empty.ranks"));
                            }

                            ranks.sort((a, b) => a.level - b.level);
                            const data = [];
                            await asyncForEach(ranks, async (rank) => {
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
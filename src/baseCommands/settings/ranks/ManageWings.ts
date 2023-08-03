import { ButtonStyle } from "discord.js";
import { existsSync, mkdirSync, unlinkSync } from "fs";
import { WINGS_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { DEFAULT_WINGS_DATA, RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { DEFAULT_CARD_CODE } from "../../../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../../../structs/databaseTypes/UserLevel";
import { CardData, drawCardWithWings } from "../../../utils/CardUtils";
import { capitalise } from "../../../utils/FormatUtils";
import { createMessageButtons } from "../../../utils/MessageButtonUtils";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getServerUserSettings, getRank } from "../../../utils/RankUtils";
import { getImageReply } from "../../../utils/ReplyUtils";
import { canvasToMessageAttachment, downloadFile, asyncForEach, getDatabase } from "../../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";
import { getRoleById } from "../../../utils/GetterUtils";
import { ModelWrapper } from "../../../structs/ModelWrapper";

export class ManageWingsBaseCommand extends BaseCommand {
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
                                        const wings = await this.getLevelWings(rankRole.document.level, cmdArgs.guildId);
                                        if (wings === DEFAULT_WINGS_DATA) {
                                            return interaction.followUp(Localisation.getTranslation("error.empty.wings"));
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

                                        Object.keys(wings).forEach(wing => {
                                            if (wings[wing] !== "") {
                                                options.push({
                                                    label: capitalise(wing),
                                                    value: wing,
                                                    onSelect: async ({ interaction }) => {
                                                        if (!existsSync(wings[wing]))
                                                            return interaction.reply(Localisation.getTranslation("error.not.findfile"));
                                                        await interaction.reply({ content: Localisation.getTranslation("setrank.wings.get", capitalise(wing)), files: [wings[wing]] });
                                                    },
                                                    default: false,
                                                    description: null,
                                                    emoji: null
                                                });
                                            }
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
                                        const { value: image, message: msg } = await getImageReply({ sendTarget: interaction, author: cmdArgs.author });
                                        if (!image) return;

                                        const rankLevel = rankRole;

                                        const userLevel = new UserLevel(cmdArgs.author.id);

                                        const serverUserSettings = await getServerUserSettings(cmdArgs.author.id, cmdArgs.guildId);

                                        serverUserSettings.document.cardCode = DEFAULT_CARD_CODE;

                                        const cardData: CardData = {
                                            leaderboardPosition: 0,
                                            weeklyLeaderboardPosition: 0,
                                            currentRank: new ModelWrapper(null),
                                            nextRank: new ModelWrapper(null),
                                            serverUserSettings,
                                            userLevel: userLevel.levelData,
                                            member: cmdArgs.member,
                                            wingsImage: image.url
                                        };

                                        const { image: wingsImage, extension } = await drawCardWithWings(cardData);

                                        await createMessageButtons({
                                            sendTarget: msg, author: cmdArgs.author, settings: { max: 1 }, options: { content: Localisation.getTranslation("generic.allcorrect"), files: [canvasToMessageAttachment(wingsImage, "testCard", extension)] }, buttons:
                                                [
                                                    {
                                                        customId: "accept",
                                                        style: ButtonStyle.Primary,
                                                        label: Localisation.getTranslation("button.accept"),
                                                        onRun: async ({ interaction }) => {
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

                                                            if (!rankLevel.document.wings) rankLevel.document.wings = DEFAULT_WINGS_DATA;

                                                            Object.keys(rankLevel.document.wings).forEach(name => {
                                                                options.push({
                                                                    label: capitalise(name),
                                                                    value: name,
                                                                    onSelect: async ({ interaction }) => {
                                                                        const dir = `${WINGS_FOLDER}/${cmdArgs.guildId}/${rankLevel.document.level}`;
                                                                        const filePath = `${dir}/${name}_${image.name}`;
                                                                        if (!existsSync(dir)) {
                                                                            mkdirSync(dir, { recursive: true });
                                                                        }
                                                                        if (existsSync(rankLevel.document.wings[name])) {
                                                                            unlinkSync(rankLevel.document.wings[name]);
                                                                        }
                                                                        await interaction.reply(Localisation.getTranslation("setrank.wings.download"));
                                                                        await downloadFile(image.url, filePath);

                                                                        rankLevel.document.wings[name] = filePath;
                                                                        await rankLevel.save();

                                                                        await interaction.deleteReply();
                                                                        await interaction.followUp(Localisation.getTranslation("setrank.wings.add", capitalise(name)));
                                                                    },
                                                                    default: false,
                                                                    description: null,
                                                                    emoji: null
                                                                });
                                                            });

                                                            await createMessageSelection({
                                                                sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                                                {
                                                                    options
                                                                }
                                                            });
                                                        }
                                                    },
                                                    {
                                                        customId: "cancel",
                                                        label: Localisation.getTranslation("button.cancel"),
                                                        style: ButtonStyle.Danger,
                                                        onRun: async ({ interaction }) => {
                                                            interaction.update({ content: Localisation.getTranslation("generic.canceled") });
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
                                        const options: SelectOption[] = [];

                                        const rankLevel = rankRole;
                                        const wings = await this.getLevelWings(rankLevel.document.level, cmdArgs.guildId);
                                        if (wings === DEFAULT_WINGS_DATA) {
                                            return interaction.followUp(Localisation.getTranslation("error.empty.wings"));
                                        }

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

                                        Object.keys(wings).forEach(wing => {
                                            if (wings[wing] !== "") {
                                                options.push({
                                                    label: capitalise(wing),
                                                    value: wing,
                                                    onSelect: async ({ interaction }) => {
                                                        if (existsSync(rankLevel.document.wings[wing]))
                                                            unlinkSync(rankLevel.document.wings[wing]);
                                                        rankLevel.document.wings[wing] = "";
                                                        await rankLevel.save();
                                                        await interaction.reply(Localisation.getTranslation("setrank.wings.remove", capitalise(wing)));
                                                    },
                                                    default: false,
                                                    description: null,
                                                    emoji: null
                                                });
                                            }
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

    async getLevelWings(level: number, guildId: string) {
        const rank = await getRank(level, guildId);
        if (rank.isNull() || !rank.document.wings)
            return DEFAULT_WINGS_DATA;
        return rank.document.wings;
    }
}
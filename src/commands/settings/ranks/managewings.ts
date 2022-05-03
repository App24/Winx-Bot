import { existsSync, mkdirSync, unlinkSync } from "fs";
import { BotUser } from "../../../BotClient";
import { WINGS_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";
import { Settings } from "../../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailable } from "../../../structs/Command";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { DEFAULT_WINGS_DATA, RankLevel } from "../../../structs/databaseTypes/RankLevel";
import { ServerUserSettings } from "../../../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../../../structs/databaseTypes/UserLevel";
import { drawCardWithWings } from "../../../utils/CardUtils";
import { capitalise } from "../../../utils/FormatUtils";
import { createMessageButtons } from "../../../utils/MessageButtonUtils";
import { createMessageSelection, SelectOption } from "../../../utils/MessageSelectionUtils";
import { getRank, getUserSettings } from "../../../utils/RankUtils";
import { getImageReply, getLevelReply } from "../../../utils/ReplyUtils";
import { canvasToMessageAttachment, downloadFile, getServerDatabase } from "../../../utils/Utils";

class ManageWingsCommand extends Command {
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
                            const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.message, author: cmdArgs.author, options: "argument.reply.level" });
                            if (level === undefined || level < 0) return;
                            const wings = await this.getLevelWings(level, cmdArgs.guildId);
                            if (wings === DEFAULT_WINGS_DATA) {
                                return interaction.followUp(Localisation.getTranslation("error.empty.wings"));
                            }

                            const options: SelectOption[] = [];

                            options.push({
                                label: Localisation.getTranslation("button.cancel"),
                                value: "-1",
                                onSelect: async ({ interaction }) => {
                                    interaction.deferUpdate();
                                }
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
                                        }
                                    });
                                }
                            });

                            createMessageSelection({
                                sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                {
                                    options
                                }
                            });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.add"),
                        value: "set",
                        onSelect: async () => {
                            const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.message, author: cmdArgs.author, options: "argument.reply.level" });
                            if (level === undefined || level < 0) return;
                            const rankLevel = await getRank(level, cmdArgs.guildId);

                            const { value: image, message: msg } = await getImageReply({ sendTarget: message, author: cmdArgs.author, options: "argument.reply.image" });
                            if (!image) return;

                            const userLevel = new UserLevel(cmdArgs.author.id);

                            const userSettings = await getUserSettings(cmdArgs.author.id);
                            const serverUserSettings = new ServerUserSettings(cmdArgs.author.id);

                            await createMessageButtons({
                                sendTarget: msg, author: cmdArgs.author, settings: { max: 1 }, options: { content: Localisation.getTranslation("generic.allcorrect"), files: [canvasToMessageAttachment(await drawCardWithWings(0, userLevel, userSettings, serverUserSettings, image.url, undefined, undefined, cmdArgs.member, cmdArgs.guild))] }, buttons:
                                    [
                                        {
                                            customId: "accept",
                                            style: "PRIMARY",
                                            label: Localisation.getTranslation("button.accept"),
                                            onRun: async ({ interaction }) => {
                                                interaction.deferUpdate();
                                                const options: SelectOption[] = [];

                                                options.push({
                                                    label: Localisation.getTranslation("button.cancel"),
                                                    value: "-1",
                                                    onSelect: async ({ interaction }) => {
                                                        interaction.deferUpdate();
                                                    }
                                                });

                                                const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
                                                const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
                                                const index = ranks.findIndex(r => r.level === rankLevel.level);

                                                Object.keys(rankLevel.wings).forEach(name => {
                                                    options.push({
                                                        label: capitalise(name),
                                                        value: name,
                                                        onSelect: async ({ interaction }) => {
                                                            const dir = `${WINGS_FOLDER}/${cmdArgs.guildId}/${rankLevel.level}`;
                                                            const filePath = `${dir}/${name}_${image.name}`;
                                                            if (!existsSync(dir)) {
                                                                mkdirSync(dir, { recursive: true });
                                                            }
                                                            if (existsSync(rankLevel.wings[name])) {
                                                                unlinkSync(rankLevel.wings[name]);
                                                            }
                                                            await interaction.reply(Localisation.getTranslation("setrank.wings.download"));
                                                            downloadFile(image.url, filePath, async () => {
                                                                if (index >= 0) {
                                                                    rankLevel.wings[name] = filePath;
                                                                    ranks[index] = rankLevel;
                                                                }
                                                                await interaction.deleteReply();
                                                                await interaction.followUp(Localisation.getTranslation("setrank.wings.add", capitalise(name)));
                                                                await Ranks.set(cmdArgs.guildId, ranks);
                                                            });
                                                        }
                                                    });
                                                });

                                                await createMessageSelection({
                                                    sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                                    {
                                                        options
                                                    }
                                                });
                                            }
                                        },
                                        {
                                            customId: "cancel",
                                            label: Localisation.getTranslation("button.cancel"),
                                            style: "DANGER",
                                            onRun: async ({ interaction }) => {
                                                interaction.update({ content: Localisation.getTranslation("generic.canceled") });
                                            }
                                        }
                                    ]
                            });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.remove"),
                        value: "delete",
                        onSelect: async ({ interaction }) => {
                            const { value: level, message } = await getLevelReply({ sendTarget: cmdArgs.message, author: cmdArgs.author, options: "argument.reply.level" });
                            if (level === undefined || level < 0) return;
                            const wings = await this.getLevelWings(level, cmdArgs.guildId);
                            if (wings === DEFAULT_WINGS_DATA) {
                                return interaction.followUp(Localisation.getTranslation("error.empty.wings"));
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

                            Object.keys(wings).forEach(wing => {
                                if (wings[wing] !== "") {
                                    options.push({
                                        label: capitalise(wing),
                                        value: wing,
                                        onSelect: async ({ interaction }) => {
                                            const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
                                            const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
                                            const index = ranks.findIndex(r => r.level === rankLevel.level);
                                            if (index >= 0) {
                                                if (existsSync(rankLevel.wings[wing]))
                                                    unlinkSync(rankLevel.wings[wing]);
                                                rankLevel.wings[wing] = "";
                                                ranks[index] = rankLevel;
                                            }
                                            await interaction.reply(Localisation.getTranslation("setrank.wings.remove", capitalise(wing)));
                                            await Ranks.set(cmdArgs.guildId, ranks);
                                        }
                                    });
                                }
                            });

                            createMessageSelection({
                                sendTarget: message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                {
                                    options
                                }
                            });
                        }
                    }
                ]
            }
        });
    }

    async getLevelWings(level: number, guildId: string) {
        const rank = await getRank(level, guildId);
        if (!rank || !rank.wings)
            return DEFAULT_WINGS_DATA;
        return rank.wings;
    }
}

export = ManageWingsCommand;
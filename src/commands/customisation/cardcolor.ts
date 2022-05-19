import { Guild, User } from "discord.js";
import { BotUser } from "../../BotClient";
import { Keyv } from "../../keyv/keyv-index";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { canvasColor } from "../../utils/CanvasUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getHexReply } from "../../utils/ReplyUtils";
import { asyncForEach, canvasToMessageAttachment, getServerDatabase } from "../../utils/Utils";

class CardColorCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["cardcolour", "backgroundcolor", "backgroundcolour"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];



        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options:
                    [
                        {
                            label: "Primary Color",
                            value: "color_a",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("COLOR_A", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild, cmdArgs.author)
                                    }
                                });
                            }
                        },
                        {
                            label: "Secondary Color",
                            value: "color_b",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("COLOR_B", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild, cmdArgs.author)
                                    }
                                });
                            }
                        },
                        {
                            label: "Both Colors",
                            value: "both",
                            onSelect: async ({ interaction }) => {
                                createMessageSelection({
                                    sendTarget: interaction, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
                                    {
                                        options: await this.updateWings("BOTH", ServerUserSettingsDatabase, serverUserSettings, userSettings, userIndex, cmdArgs.guild, cmdArgs.author)
                                    }
                                });
                            }
                        }
                    ]
            }
        });
    }

    async updateWings(setType: "COLOR_A" | "COLOR_B" | "BOTH", ServerUserSettingsDatabase: Keyv, serverUserSettings: ServerUserSettings[], userSettings: ServerUserSettings, userIndex: number, guild: Guild, author: User) {
        const options: SelectOption[] = [];

        if (userSettings.cardColorB === undefined) {
            userSettings.cardColorB = new ServerUserSettings(author.id).cardColorB;
        }

        options.push({
            label: Localisation.getTranslation("button.get"),
            value: "get",
            onSelect: async ({ interaction }) => {
                const colors: { type: string, color: string }[] = [];
                if (setType === "COLOR_A" || setType === "BOTH") {
                    colors.push({ type: "Primary Color", color: userSettings.cardColor });
                }

                if (setType === "COLOR_B" || setType === "BOTH") {
                    colors.push({ type: "Secondary Color", color: userSettings.cardColorB });
                }

                if (colors.length >= 2) {
                    const colorA = colors[0];
                    const colorB = colors[1];
                    if (colorA.color === colorB.color) {
                        colors.slice(0, colors.length);
                        colors.push({ type: "Both Colors", color: colorA.color });
                    }
                }

                await interaction.deferUpdate();

                await asyncForEach(colors, async (color) => {
                    const text = color.type;
                    await interaction.followUp({ content: `${text}\n${Localisation.getTranslation("generic.hexcolor", color.color)}`, files: [canvasToMessageAttachment(canvasColor(color.color))] });
                });
            }
        });

        options.push({
            label: Localisation.getTranslation("button.set"),
            value: "set",
            onSelect: async ({ interaction }) => {
                const { value: color, message } = await getHexReply({ sendTarget: interaction, author: author });
                if (color === undefined) return;
                if (setType === "COLOR_A" || setType === "BOTH") {
                    userSettings.cardColor = color;
                }

                if (setType === "COLOR_B" || setType === "BOTH") {
                    userSettings.cardColorB = color;
                }
                serverUserSettings[userIndex] = userSettings;
                message.reply(Localisation.getTranslation("cardcolor.set.output", color));
                await ServerUserSettingsDatabase.set(guild.id, serverUserSettings);
            }
        });

        options.push({
            label: Localisation.getTranslation("button.reset"),
            value: "reset",
            onSelect: async ({ interaction }) => {
                const defaultSettings = new ServerUserSettings(author.id);
                if (setType === "COLOR_A" || setType === "BOTH") {
                    userSettings.cardColor = defaultSettings.cardColor;
                }

                if (setType === "COLOR_B" || setType === "BOTH") {
                    userSettings.cardColorB = defaultSettings.cardColorB;
                }
                serverUserSettings[userIndex] = userSettings;
                await ServerUserSettingsDatabase.set(guild.id, serverUserSettings);
                await interaction.reply(Localisation.getTranslation("cardcolor.reset.output"));
            }
        });

        return options;
    }
}

export = CardColorCommand;
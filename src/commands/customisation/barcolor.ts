import { createCanvas } from "canvas";
import { MessageComponentInteraction, User } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { canvasColor, cloneCanvas } from "../../utils/CanvasUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getHexReply } from "../../utils/ReplyUtils";
import { canvasToMessageAttachment, getServerDatabase } from "../../utils/Utils";

class BarColorCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["barcolour"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                onSelection: async ({ interaction }) => {
                    await interaction.deferUpdate();
                },
                options:
                    [
                        {
                            label: Localisation.getTranslation("button.start"),
                            value: "start",
                            onSelect: async ({ interaction }) => {
                                await this.createSecondaryButtons(interaction, cmdArgs.author, cmdArgs.guildId, BarMode.Start);
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.end"),
                            value: "end",
                            onSelect: async ({ interaction }) => {
                                await this.createSecondaryButtons(interaction, cmdArgs.author, cmdArgs.guildId, BarMode.End);
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.both"),
                            value: "both",
                            onSelect: async ({ interaction }) => {
                                await this.createSecondaryButtons(interaction, cmdArgs.author, cmdArgs.guildId, BarMode.Start | BarMode.End);
                            }
                        }
                    ]
            }
        });
    }

    async createSecondaryButtons(interaction: MessageComponentInteraction, author: User, guildId: string, mode: BarMode) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        await createMessageSelection({
            sendTarget: interaction, author, settings: { max: 1 }, selectMenuOptions:
            {
                options:
                    [
                        {
                            label: Localisation.getTranslation("button.get"),
                            value: "get",
                            onSelect: async ({ interaction }) => {
                                const canvas = createCanvas(0, 0);
                                const ctx = canvas.getContext("2d");

                                const text = [];

                                if ((mode & BarMode.Start) === BarMode.Start) {
                                    const startPosX = canvas.width;
                                    const otherCanvas = canvasColor(userSettings.barStartColor);
                                    const previousCanvas = cloneCanvas(canvas);

                                    canvas.width += otherCanvas.width;
                                    canvas.height = otherCanvas.height;

                                    ctx.drawImage(previousCanvas, 0, 0);
                                    ctx.drawImage(otherCanvas, startPosX, 0);

                                    text.push(Localisation.getTranslation("barcolor.hexcolor.output", "Start", userSettings.barStartColor));
                                }

                                if ((mode & BarMode.End) === BarMode.End) {
                                    const startPosX = canvas.width;
                                    const otherCanvas = canvasColor(userSettings.barEndColor);
                                    const previousCanvas = cloneCanvas(canvas);

                                    canvas.width += otherCanvas.width;
                                    canvas.height = otherCanvas.height;

                                    ctx.drawImage(previousCanvas, 0, 0);
                                    ctx.drawImage(otherCanvas, startPosX, 0);

                                    text.push(Localisation.getTranslation("barcolor.hexcolor.output", "End", userSettings.barEndColor));
                                }

                                if (mode === (BarMode.Start | BarMode.End)) {
                                    const x = canvas.width / 2.;

                                    ctx.fillStyle = "black";
                                    ctx.fillRect(x - 2, 0, 4, canvas.height);
                                }

                                await interaction.reply({ content: text.join("      "), files: [canvasToMessageAttachment(canvas)] });
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.set"),
                            value: "set",
                            onSelect: async ({ interaction }) => {
                                const { value: color, message } = await getHexReply({ sendTarget: interaction, author: author, options: Localisation.getTranslation("argument.reply.hexcolor") });
                                if (color === undefined) return;

                                const append = [];

                                if ((mode & BarMode.Start) === BarMode.Start) {
                                    append.push(Localisation.getTranslation("barcolor.start"));
                                }
                                if ((mode & BarMode.End) === BarMode.End) {
                                    append.push(Localisation.getTranslation("barcolor.end"));
                                } if ((mode & BarMode.Start) === BarMode.Start) {
                                    userSettings.barStartColor = color;
                                }

                                if ((mode & BarMode.End) === BarMode.End) {
                                    userSettings.barEndColor = color;
                                }

                                serverUserSettings[userIndex] = userSettings;

                                await ServerUserSettingsDatabase.set(guildId, serverUserSettings);
                                return message.reply(Localisation.getTranslation("barcolor.set.output", append.join(" and "), color));
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.reset"),
                            value: "reset",
                            onSelect: async ({ interaction }) => {
                                const append = [];

                                if ((mode & BarMode.Start) === BarMode.Start) {
                                    append.push(Localisation.getTranslation("barcolor.start"));
                                }
                                if ((mode & BarMode.End) === BarMode.End) {
                                    append.push(Localisation.getTranslation("barcolor.end"));
                                }

                                if ((mode & BarMode.Start) === BarMode.Start) {
                                    userSettings.barStartColor = new ServerUserSettings(author.id).barStartColor;
                                }
                                if ((mode & BarMode.End) === BarMode.End) {
                                    userSettings.barEndColor = new ServerUserSettings(author.id).barEndColor;
                                }

                                serverUserSettings[userIndex] = userSettings;
                                await ServerUserSettingsDatabase.set(guildId, serverUserSettings);
                                return interaction.update({ content: Localisation.getTranslation("barcolor.reset.output", append.join(" and ")) });
                            }
                        },
                    ]
            }
        });
    }
}

enum BarMode {
    Start = 1,
    End = 2
}

export = BarColorCommand;
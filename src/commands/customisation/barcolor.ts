import { createCanvas } from "canvas";
import { MessageComponentInteraction, User } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { canvasColor, cloneCanvas } from "../../utils/CanvasUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getHexReply } from "../../utils/ReplyUtils";
import { canvasToMessageAttachment } from "../../utils/Utils";

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
                                await this.createSecondaryButtons(interaction, cmdArgs.author, BarMode.Start);
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.end"),
                            value: "end",
                            onSelect: async ({ interaction }) => {
                                await this.createSecondaryButtons(interaction, cmdArgs.author, BarMode.End);
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.both"),
                            value: "both",
                            onSelect: async ({ interaction }) => {
                                await this.createSecondaryButtons(interaction, cmdArgs.author, BarMode.Start | BarMode.End);
                            }
                        }
                    ]
            }
        });

        /*createWhatToDoButtons({
            sendTarget: cmdArgs.message, author: cmdArgs.author, buttons: [
                {
                    customId: "start", style: "PRIMARY", label: Localisation.getTranslation("button.start"), onRun: async ({ interaction, data }) => {
                        data.information = { type: BarMode.Start };

                        const row = new MessageActionRow();
                        row.addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.reset") })
                        );

                        await interaction.update({ components: [row] });
                    }
                },
                {
                    customId: "end", style: "PRIMARY", label: Localisation.getTranslation("button.end"), onRun: async ({ interaction, data }) => {
                        data.information = { type: BarMode.End };

                        const row = new MessageActionRow();
                        row.addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.reset") })
                        );

                        await interaction.update({ components: [row] });
                    }
                },
                {
                    customId: "both", style: "PRIMARY", label: Localisation.getTranslation("button.both"), onRun: async ({ interaction, data }) => {
                        data.information = { type: BarMode.Start | BarMode.End };

                        const row = new MessageActionRow();
                        row.addComponents(
                            new MessageButton({ customId: "get", style: "PRIMARY", label: Localisation.getTranslation("button.get") }),
                            new MessageButton({ customId: "set", style: "PRIMARY", label: Localisation.getTranslation("button.set") }),
                            new MessageButton({ customId: "reset", style: "DANGER", label: Localisation.getTranslation("button.reset") })
                        );

                        await interaction.update({ components: [row] });
                    }
                },
                {
                    hidden: true,
                    customId: "get", style: "PRIMARY", onRun: async ({ interaction, data }) => {
                        const mode: BarMode = data.information.type;

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

                        await interaction.reply({ content: text.join("      "), components: [], files: [canvasToMessageAttachment(canvas)] });
                    }
                },
                {
                    hidden: true,
                    customId: "set", style: "PRIMARY", onRun: async ({ interaction, data }) => {
                        await interaction.update({ content: Localisation.getTranslation("argument.reply.hexcolor"), components: [] });
                        const reply = await interaction.fetchReply();

                        const mode: BarMode = data.information.type;

                        const append = [];

                        if ((mode & BarMode.Start) === BarMode.Start) {
                            append.push(Localisation.getTranslation("barcolor.start"));
                        }
                        if ((mode & BarMode.End) === BarMode.End) {
                            append.push(Localisation.getTranslation("barcolor.end"));
                        }

                        createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                            let color = msg.content.toLowerCase();
                            if (color.startsWith("#")) {
                                color = color.substring(1);
                            }

                            if (!isHexColor(color)) return <any>cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));

                            if ((mode & BarMode.Start) === BarMode.Start) {
                                userSettings.barStartColor = color;
                            }

                            if ((mode & BarMode.End) === BarMode.End) {
                                userSettings.barEndColor = color;
                            }

                            await UserSettings.set(cmdArgs.author.id, userSettings);
                            return cmdArgs.message.reply(Localisation.getTranslation("barcolor.set.output", append.join(" and "), color));
                        });
                    }
                },
                {
                    hidden: true,
                    customId: "reset", style: "DANGER", onRun: async ({ interaction, data }) => {
                        const mode: BarMode = data.information.type;

                        const append = [];

                        if ((mode & BarMode.Start) === BarMode.Start) {
                            append.push(Localisation.getTranslation("barcolor.start"));
                        }
                        if ((mode & BarMode.End) === BarMode.End) {
                            append.push(Localisation.getTranslation("barcolor.end"));
                        }

                        if ((mode & BarMode.Start) === BarMode.Start) {
                            userSettings.barStartColor = DEFAULT_USER_SETTING.barStartColor;
                        }
                        if ((mode & BarMode.End) === BarMode.End) {
                            userSettings.barEndColor = DEFAULT_USER_SETTING.barEndColor;
                        }
                        await UserSettings.set(cmdArgs.author.id, userSettings);
                        return interaction.update({ content: Localisation.getTranslation("barcolor.reset.output", append.join(" and ")), components: [] });
                    }
                }
            ]
        });*/
    }

    async createSecondaryButtons(interaction: MessageComponentInteraction, author: User, mode: BarMode) {
        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings: UserSetting = await UserSettings.get(author.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(author.id, userSettings);
        }

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

                                await UserSettings.set(author.id, userSettings);
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
                                    userSettings.barStartColor = DEFAULT_USER_SETTING.barStartColor;
                                }
                                if ((mode & BarMode.End) === BarMode.End) {
                                    userSettings.barEndColor = DEFAULT_USER_SETTING.barEndColor;
                                }
                                await UserSettings.set(author.id, userSettings);
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
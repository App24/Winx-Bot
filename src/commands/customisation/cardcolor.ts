import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { canvasColor } from "../../utils/CanvasUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { createMessageCollector } from "../../utils/MessageUtils";
import { canvasToMessageAttachment, isHexColor } from "../../utils/Utils";

class CardColorCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["cardcolour"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings: UserSetting = await UserSettings.get(cmdArgs.author.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

        await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: [
                {
                    customId: "select",
                    placeholder: Localisation.getTranslation("generic.selectmenu.placeholder"),
                    options: [
                        {
                            label: Localisation.getTranslation("button.get"),
                            value: "get",
                            onSelect: async ({ interaction }) => {
                                await interaction.reply({ content: Localisation.getTranslation("generic.hexcolor", userSettings.cardColor), files: [canvasToMessageAttachment(canvasColor(userSettings.cardColor))] });
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.set"),
                            value: "set",
                            onSelect: async ({ interaction }) => {
                                await interaction.reply({ content: Localisation.getTranslation("argument.reply.hexcolor"), components: [] });
                                const reply = await interaction.fetchReply();
                                createMessageCollector(cmdArgs.channel, reply.id, cmdArgs.author, { max: 1, time: 1000 * 60 * 5 }).on("collect", async (msg) => {
                                    let color = msg.content.toLowerCase();
                                    if (color.startsWith("#")) {
                                        color = color.substring(1);
                                    }
                                    if (!isHexColor(color)) return <any>cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
                                    userSettings.cardColor = color;
                                    cmdArgs.message.reply(Localisation.getTranslation("cardcolor.set.output", color));
                                    await UserSettings.set(cmdArgs.author.id, userSettings);
                                });
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.reset"),
                            value: "reset",
                            onSelect: async ({ interaction }) => {
                                userSettings.cardColor = DEFAULT_USER_SETTING.cardColor;
                                await UserSettings.set(cmdArgs.author.id, userSettings);
                                await interaction.reply(Localisation.getTranslation("cardcolor.reset.output"));
                            }
                        }
                    ]
                }
            ]
        });
    }
}

export = CardColorCommand;
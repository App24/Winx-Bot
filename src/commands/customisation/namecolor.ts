import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { canvasColor } from "../../utils/CanvasUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getHexReply } from "../../utils/ReplyUtils";
import { isHexColor, canvasToMessageAttachment } from "../../utils/Utils";

class NameColorCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["namecolour"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings = await UserSettings.get(cmdArgs.author.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            if (userSettings.nameColor === DEFAULT_USER_SETTING.nameColor || !isHexColor(userSettings.nameColor))
                                return await interaction.reply(Localisation.getTranslation("error.invalid.namecolor"));
                            await interaction.reply({ content: Localisation.getTranslation("generic.hexcolor", userSettings.nameColor), files: [canvasToMessageAttachment(canvasColor(userSettings.nameColor))] });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.set"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            const { value: color, message } = await getHexReply({ sendTarget: interaction, author: cmdArgs.author, options: Localisation.getTranslation("argument.reply.hexcolor") });
                            if (color === undefined) return;
                            userSettings.nameColor = color;
                            message.reply(Localisation.getTranslation("namecolor.set.output", color));
                            await UserSettings.set(cmdArgs.author.id, userSettings);
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.reset"),
                        value: "reset",
                        onSelect: async ({ interaction }) => {
                            userSettings.nameColor = DEFAULT_USER_SETTING.nameColor;
                            await UserSettings.set(cmdArgs.author.id, userSettings);
                            await interaction.reply(Localisation.getTranslation("namecolor.reset.output"));
                        }
                    }
                ]
            }
        }
        );
    }
}

export = NameColorCommand;
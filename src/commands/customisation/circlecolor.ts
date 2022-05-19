import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { canvasColor } from "../../utils/CanvasUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getHexReply } from "../../utils/ReplyUtils";
import { canvasToMessageAttachment, getServerDatabase } from "../../utils/Utils";

class CircleColorCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["circlecolour"];
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

        await createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options: [
                    {
                        label: Localisation.getTranslation("button.get"),
                        value: "get",
                        onSelect: async ({ interaction }) => {
                            if (!userSettings.specialCircleColor)
                                return await interaction.reply("No color circle");
                            await interaction.reply({ content: Localisation.getTranslation("generic.hexcolor", userSettings.specialCircleColor), files: [canvasToMessageAttachment(canvasColor(userSettings.specialCircleColor))] });
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.set"),
                        value: "set",
                        onSelect: async ({ interaction }) => {
                            const { value: color, message } = await getHexReply({ sendTarget: interaction, author: cmdArgs.author });
                            if (color === undefined) return;
                            userSettings.specialCircleColor = color;
                            serverUserSettings[userIndex] = userSettings;
                            message.reply(Localisation.getTranslation("circlecolor.set.output", color));
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                        }
                    },
                    {
                        label: Localisation.getTranslation("button.reset"),
                        value: "reset",
                        onSelect: async ({ interaction }) => {
                            userSettings.specialCircleColor = new ServerUserSettings(cmdArgs.author.id).specialCircleColor;
                            serverUserSettings[userIndex] = userSettings;
                            await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                            await interaction.reply(Localisation.getTranslation("circlecolor.reset.output"));
                        }
                    }
                ]
            }
        });
    }
}

export = CircleColorCommand;
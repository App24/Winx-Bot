import { BotUser } from "../../BotClient";
import { UserSettings } from "../../structs/Category";
import { Command, CommandArguments, CommandAvailable } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createGenericButtons } from "../../utils/MessageButtonUtils";
import { getServerDatabase } from "../../utils/Utils";

class CardNameCommand extends Command {
    public constructor() {
        super();
        this.category = UserSettings;
        this.available = CommandAvailable.Guild;
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

        if (userSettings.cardName === undefined) {
            userSettings.cardName = true;
        }

        createGenericButtons({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, buttons: [
                {
                    customId: "toggle",
                    label: userSettings.cardName ? "Disable" : "Enable",
                    style: "PRIMARY",
                    onRun: async ({ interaction }) => {
                        userSettings.cardName = !userSettings.cardName;
                        interaction.reply({ content: `Card name is now ${(userSettings.cardName ? "enabled" : "disabled")}!` });
                        serverUserSettings[userIndex] = userSettings;
                        await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                    }
                },
                {
                    customId: "cancel",
                    label: "Cancel",
                    style: "PRIMARY",
                    onRun: async ({ interaction }) => {
                        await interaction.deferUpdate();
                    }
                }
            ]
        });
    }
}

export = CardNameCommand;
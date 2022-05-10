import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { UserSettings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CardTemplate, ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getServerDatabase } from "../../utils/Utils";

class WingsTemplateCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = UserSettings;
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

        const keys = Object.keys(CardTemplate);

        const options: SelectOption[] = [];

        keys.forEach(key => {
            options.push({
                label: key,
                value: key.toLowerCase(),
                default: userSettings.wingsTemplate === CardTemplate[key],
                onSelect: async ({ interaction }) => {
                    userSettings.wingsTemplate = CardTemplate[key];

                    serverUserSettings[userIndex] = userSettings;
                    await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                    interaction.reply(Localisation.getTranslation("wingstemplate.set", key));
                }
            });
        });

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options
            }
        });
    }
}

export = WingsTemplateCommand;
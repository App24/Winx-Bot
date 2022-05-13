import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { UserSettings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CardTemplate, ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getServerDatabase } from "../../utils/Utils";

class CardTemplateCommand extends Command {
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
                label: key.replace("_", " "),
                value: key.toLowerCase(),
                default: userSettings.cardTemplate === CardTemplate[key],
                onSelect: async ({ interaction }) => {
                    userSettings.cardTemplate = CardTemplate[key];

                    serverUserSettings[userIndex] = userSettings;
                    await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                    interaction.reply(Localisation.getTranslation("cardtemplate.set", key.replace("_", " ")));
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

export = CardTemplateCommand;
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { capitalise } from "../../utils/FormatUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";
import { getServerDatabase } from "../../utils/Utils";

class WinxCharacterCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["setcharacter", "setwinx"];
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

        if (!userSettings.winxCharacter) userSettings.winxCharacter = WinxCharacter.None;

        const options: SelectOption[] = [];
        Object.keys(WinxCharacter).forEach((character) => {
            if (isNaN(parseInt(character))) {
                options.push({
                    value: character,
                    label: capitalise(character),
                    default: character === WinxCharacter[userSettings.winxCharacter],
                    onSelect: async ({ interaction }) => {
                        userSettings.winxCharacter = WinxCharacter[character];
                        serverUserSettings[userIndex] = userSettings;
                        await interaction.reply(Localisation.getTranslation("winxcharacter.set", WinxCharacter[userSettings.winxCharacter]));
                        await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                    }
                });
            }
        });

        options.push({
            value: "cancel",
            label: Localisation.getTranslation("generic.cancel"),
            onSelect: async ({ interaction }) => {
                interaction.deferUpdate();
            }
        });

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getTranslation("generic.selectcurrentcharacter", cmdArgs.author), selectMenuOptions:
            {
                options
            }
        });
    }
}

export = WinxCharacterCommand;
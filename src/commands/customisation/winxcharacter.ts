import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments, CommandAvailable, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { capitalise } from "../../utils/FormatUtils";
import { getMemberFromMention } from "../../utils/GetterUtils";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";

class WinxCharacterCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["setcharacter", "setwinx"];
        this.usage = [new CommandUsage(false, Localisation.getTranslation("argument.user"))];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
        if (cmdArgs.args[0]) {
            const user = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
            if (user) {
                let userSettings: UserSetting = await UserSettings.get(user.id);
                if (!userSettings) {
                    userSettings = DEFAULT_USER_SETTING;
                    await UserSettings.set(cmdArgs.author.id, userSettings);
                }

                if (!userSettings.winxCharacter) userSettings.winxCharacter = WinxCharacter.None;

                cmdArgs.message.reply(Localisation.getTranslation("generic.currentcharacter", user, WinxCharacter[userSettings.winxCharacter]));
                return;
            }
        }

        let userSettings: UserSetting = await UserSettings.get(cmdArgs.author.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

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
                        await interaction.reply(Localisation.getTranslation("winxcharacter.set", WinxCharacter[userSettings.winxCharacter]));
                        await UserSettings.set(cmdArgs.author.id, userSettings);
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
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, text: Localisation.getTranslation("generic.selectcurrentcharacter", cmdArgs.author), selectMenuOptions: [
                {
                    customId: "characters",
                    placeholder: Localisation.getTranslation("generic.selectmenu.placeholder"),
                    options
                }
            ]
        });
    }
}

export = WinxCharacterCommand;
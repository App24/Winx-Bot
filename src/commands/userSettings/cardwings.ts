import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { capitalise } from "../../utils/FormatUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getServerDatabase } from "../../utils/Utils";

class CardWingsCommand extends Command {
    public constructor() {
        super();
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

        if (userSettings.cardWings === undefined) {
            userSettings.cardWings = "ENABLED";
        }

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options:
                    [
                        {
                            label: Localisation.getTranslation("button.enable"),
                            value: "enable",
                            default: userSettings.cardWings === "ENABLED",
                            onSelect: async ({ interaction }) => {
                                userSettings.cardWings = "ENABLED";
                                interaction.reply({ content: Localisation.getTranslation("cardwings.reply", capitalise(userSettings.cardWings)) });
                                serverUserSettings[userIndex] = userSettings;
                                await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.custom"),
                            value: "custom",
                            default: userSettings.cardWings === "CUSTOM",
                            onSelect: async ({ interaction }) => {
                                userSettings.cardWings = "CUSTOM";
                                interaction.reply({ content: Localisation.getTranslation("cardwings.reply", capitalise(userSettings.cardWings)) });
                                serverUserSettings[userIndex] = userSettings;
                                await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                            }
                        },
                        {
                            label: Localisation.getTranslation("button.cancel"),
                            value: "cancel",
                            onSelect: async ({ interaction }) => {
                                await interaction.deferUpdate();
                            }
                        }
                    ]
            }
        });
    }
}

export = CardWingsCommand;
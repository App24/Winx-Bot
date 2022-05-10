import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { UserSettings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { capitalise } from "../../utils/FormatUtils";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
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
            userSettings.cardName = "NICKNAME";
        }

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions:
            {
                options:
                    [
                        {
                            label: "Disable",
                            value: "disable",
                            default: userSettings.cardName === "DISABLED",
                            onSelect: async ({ interaction }) => {
                                userSettings.cardName = "DISABLED";
                                interaction.reply({ content: Localisation.getTranslation("cardname.reply", capitalise(userSettings.cardName)) });
                                serverUserSettings[userIndex] = userSettings;
                                await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                            }
                        },
                        {
                            label: "Username",
                            value: "username",
                            default: userSettings.cardName === "USERNAME",
                            onSelect: async ({ interaction }) => {
                                userSettings.cardName = "USERNAME";
                                interaction.reply({ content: Localisation.getTranslation("cardname.reply", capitalise(userSettings.cardName)) });
                                serverUserSettings[userIndex] = userSettings;
                                await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                            }
                        },
                        {
                            label: "Nickname",
                            value: "nickname",
                            default: userSettings.cardName === "NICKNAME",
                            onSelect: async ({ interaction }) => {
                                userSettings.cardName = "NICKNAME";
                                interaction.reply({ content: Localisation.getTranslation("cardname.reply", capitalise(userSettings.cardName)) });
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

        /*createGenericButtons({
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
        });*/
    }
}

export = CardNameCommand;
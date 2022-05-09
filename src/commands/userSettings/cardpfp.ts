import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { UserSettings } from "../../structs/Category";
import { Command, CommandArguments, CommandAvailable } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { getServerDatabase } from "../../utils/Utils";

class CardPfpCommand extends Command {
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

        if (userSettings.animatedCard === undefined) {
            userSettings.animatedCard = true;
        }

        createMessageButtons({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, options: Localisation.getTranslation("cardpfp.warning"), buttons: [
                {
                    customId: "toggle",
                    label: userSettings.animatedCard ? Localisation.getTranslation("button.disable") : Localisation.getTranslation("button.enable"),
                    style: "PRIMARY",
                    onRun: async ({ interaction }) => {
                        userSettings.animatedCard = !userSettings.animatedCard;
                        interaction.reply({ content: Localisation.getTranslation("cardpfp.reply", userSettings.animatedCard ? Localisation.getTranslation("generic.enabled") : Localisation.getTranslation("generic.disabled")) });
                        serverUserSettings[userIndex] = userSettings;
                        await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                    }
                },
                {
                    customId: "cancel",
                    label: Localisation.getTranslation("button.cancel"),
                    style: "PRIMARY",
                    onRun: async ({ interaction }) => {
                        await interaction.deferUpdate();
                    }
                }
            ]
        });
    }
}

export = CardPfpCommand;
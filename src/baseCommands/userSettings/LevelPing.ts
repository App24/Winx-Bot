import { ButtonStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageButtons } from "../../utils/MessageButtonUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class LevelPingBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        if (userSettings.levelPing === undefined) {
            userSettings.levelPing = false;
        }

        createMessageButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { max: 1 }, buttons: [
                {
                    customId: "toggle",
                    emoji: userSettings.levelPing ? "❌": "✅",
                    style: ButtonStyle.Primary,
                    onRun: async ({ interaction }) => {
                        userSettings.levelPing = !userSettings.levelPing;
                        interaction.reply({ content: Localisation.getTranslation("levelping.reply", userSettings.levelPing ? Localisation.getTranslation("generic.enabled") : Localisation.getTranslation("generic.disabled")) });
                        serverUserSettings[userIndex] = userSettings;
                        await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
                    }
                },
                {
                    customId: "cancel",
                    label: Localisation.getTranslation("button.cancel"),
                    style: ButtonStyle.Danger,
                    onRun: async ({ interaction }) => {
                        await interaction.deferUpdate();
                    }
                }
            ]
        });
    }
}
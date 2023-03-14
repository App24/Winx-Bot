import { LevelPingBaseCommand } from "../../baseCommands/userSettings/LevelPing";
import { UserSettings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";

class LevelPingCommand extends Command {
    public constructor() {
        super();
        this.category = UserSettings;
        this.available = CommandAvailable.Guild;
        this.aliases = ["pinglevel"];

        this.baseCommand = new LevelPingBaseCommand();
    }

    /*public async onRun(cmdArgs: CommandArguments) {
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
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, buttons: [
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
    }*/
}

export = LevelPingCommand;
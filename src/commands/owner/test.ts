/*import { BotUser } from "../../BotClient";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { UserSetting } from "../../structs/databaseTypes/UserSetting";
import { getMemberById } from "../../utils/GetterUtils";
import { asyncForEach, asyncMapForEach, getServerDatabase } from "../../utils/Utils";

class TestCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
        const ServerUserSetting = BotUser.getDatabase(DatabaseType.ServerUserSettings);

        const users: { key: string, value: UserSetting }[] = await UserSettings.entries();

        cmdArgs.message.reply("Starting...");
        const guilds = await BotUser.guilds.fetch();
        await asyncMapForEach(guilds, async (id, oauthguild) => {
            const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSetting, id);
            const guild = await oauthguild.fetch();
            await asyncForEach(users, async (user) => {
                const member = await getMemberById(user.key, guild);
                if (member) {
                    let userIndex = serverUserSettings.findIndex(u => u.userId === user.key);
                    if (userIndex < 0) {
                        serverUserSettings.push(new ServerUserSettings(user.key));
                        userIndex = serverUserSettings.length - 1;
                    }
                    const userSettings = serverUserSettings[userIndex];

                    const globalUserSettings = user.value;

                    userSettings.barStartColor = globalUserSettings.barStartColor;
                    userSettings.barEndColor = globalUserSettings.barEndColor;
                    userSettings.cardColor = globalUserSettings.cardColor;
                    userSettings.nameColor = globalUserSettings.nameColor;
                    userSettings.specialCircleColor = globalUserSettings.specialCircleColor;
                    userSettings.winxCharacter = globalUserSettings.winxCharacter;

                    serverUserSettings[userIndex] = userSettings;
                }
            });
            await ServerUserSetting.set(id, serverUserSettings);
        });
        cmdArgs.message.reply("Done");
    }
}

export = TestCommand;*/
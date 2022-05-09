import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailable, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { UserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { drawCard } from "../../utils/CardUtils";
import { getMemberById } from "../../utils/GetterUtils";
import { getCurrentRank, getNextRank } from "../../utils/RankUtils";
import { asyncForEach, canvasToMessageAttachment } from "../../utils/Utils";

class TestMLCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.level"), new CommandUsage(false, "all")];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.cooldown = 0;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
        let winxNumber = 0;
        if (cmdArgs.args.length > 1) {
            winxNumber = parseInt(cmdArgs.args[1]);
            if (isNaN(winxNumber) || winxNumber < 0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
        }

        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);


        const user = cmdArgs.author;

        const leaderboardPosition = 0;

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        const userLevel = new UserLevel(user.id);
        let userSettings: UserSetting = await UserSettings.get(user.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(user.id, userSettings);
        }

        userLevel.xp = 0;
        userLevel.level = level;

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = new ServerUserSettings(cmdArgs.author.id);
        serverUserSettings.animatedCard = false;

        if (winxNumber > 0) {
            await asyncForEach(Object.keys(WinxCharacter), async (val) => {
                if (val === "None") return;
                if (isNaN(parseInt(val))) {
                    userSettings.winxCharacter = WinxCharacter[val];
                    const { image, extension } = await drawCard(leaderboardPosition, userLevel, userSettings, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);
                    await cmdArgs.message.reply({ content: val, files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
                }
            });
        } else {
            const { image, extension } = await drawCard(leaderboardPosition, userLevel, userSettings, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);
            cmdArgs.message.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });
        }

    }
}

export = TestMLCommand;
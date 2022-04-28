import { BotUser } from "../../BotClient";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandUsage, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { getServerDatabase, canvasToMessageAttachment, getLeaderboardMembers } from "../../utils/Utils";
import { getCurrentRank, getNextRank, getUserSettings } from "../../utils/RankUtils";
import { drawCard } from "../../utils/CardUtils";

class LevelsCommand extends Command {
    public constructor() {
        super();
        this.usage = [new CommandUsage(false, "argument.user")];
        this.available = CommandAvailable.Guild;
        this.category = Rank;
        this.aliases = ["ml", "magiclevels"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);

        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);

        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const tempUser = await getUserFromMention(cmdArgs.args[0]);
            if (!tempUser) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
            user = tempUser;
        }
        if (user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);
        let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id) + 1;
        if (leaderboardPosition <= 0) {
            leaderboardPosition = levels.findIndex(u => u.userId === user.id) + 1;
        }

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }
        let userSettings: UserSetting = await UserSettings.get(user.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(user.id, userSettings);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getUserSettings(user.id, cmdArgs.guildId);

        cmdArgs.message.reply({ files: [canvasToMessageAttachment(await drawCard(leaderboardPosition, userLevel, userSettings, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild), "magiclevels")] });
    }
}

export = LevelsCommand;
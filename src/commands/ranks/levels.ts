import { BotUser } from "../../BotClient";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Rank } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase, canvasToMessageAttachment, getLeaderboardMembers } from "../../utils/Utils";
import { getCurrentRank, getNextRank, getServerUserSettings } from "../../utils/RankUtils";
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

        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        const msg = await cmdArgs.message.reply(Localisation.getTranslation("magiclevels.generate"));

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);
        let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (leaderboardPosition < 0) {
            leaderboardPosition = levels.findIndex(u => u.userId === user.id);
        }
        leaderboardPosition += 1;

        let userLevel = levels.find(u => u.userId === user.id);
        if (!userLevel) {
            await levels.push(new UserLevel(user.id));
            userLevel = levels.find(u => u.userId === user.id);
        }

        const currentRank = await getCurrentRank(userLevel.level, cmdArgs.guildId);
        const nextRank = await getNextRank(userLevel.level, cmdArgs.guildId);

        const serverUserSettings = await getServerUserSettings(user.id, cmdArgs.guildId);

        const { image, extension } = await drawCard(leaderboardPosition, userLevel, serverUserSettings, currentRank, nextRank, member, cmdArgs.guild);

        cmdArgs.message.reply({ files: [canvasToMessageAttachment(image, "magiclevels", extension)] });

        msg.delete();
    }
}

export = LevelsCommand;
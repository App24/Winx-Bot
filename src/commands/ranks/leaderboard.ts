import { Rank } from "../../structs/Category";
import { Command, CommandUsage } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { LeaderboardBaseCommand } from "../../baseCommands/ranks/Leaderboard";

class RankCommand extends Command {
    public constructor() {
        super();
        this.category = Rank;
        this.usage = [new CommandUsage(false, "argument.user")];
        this.aliases = ["rank", "lb"];
        this.available = CommandAvailable.Guild;

        this.baseCommand = new LeaderboardBaseCommand();
    }

    /*public async onRun(cmdArgs: CommandArguments) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        if (!levels.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const temp = await getUserFromMention(cmdArgs.args[0]);
            if (!temp) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.user"));
            user = temp;
        }
        if (user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));
        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));

        const msg = await cmdArgs.message.reply(Localisation.getTranslation("leaderboard.generate"));

        levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild);

        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (index < 0) {
            const i = levels.findIndex(u => u.userId === user.id);
            if (i >= 0) {
                leaderboardLevels.push({ userLevel: levels[i], member, position: i });
            } else {
                return cmdArgs.message.reply(Localisation.getTranslation("error.null.userLevel"));
            }
        }

        const leaderBoard = await drawLeaderboard(leaderboardLevels, user, cmdArgs.guildId);

        cmdArgs.message.reply({ files: [canvasToMessageAttachment(leaderBoard, "leaderboard")] });

        msg.delete();
    }*/
}

export = RankCommand;
import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { drawLeaderboard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getServerDatabase, getLeaderboardMembers, canvasToMessageAttachment } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { RecentLeaderboardData } from "../../structs/databaseTypes/RecentLeaderboard";

export class WeeklyLeaderboardBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const RecentLeaderboard = BotUser.getDatabase(DatabaseType.RecentLeaderboard);
        const recentLeaderboard: RecentLeaderboardData = await getServerDatabase(RecentLeaderboard, cmdArgs.guildId, new RecentLeaderboardData());
        if (!recentLeaderboard.users.length) return cmdArgs.reply("error.empty.levels");

        let user = cmdArgs.author;
        if (cmdArgs.args.length) {
            const temp = await getUserFromMention(cmdArgs.args[0]);
            if (!temp) return cmdArgs.reply("error.invalid.user");
            user = temp;
        }
        if (user.bot) return cmdArgs.reply("error.user.bot");
        const member = await getMemberById(user.id, cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");

        let msg: Message;
        if (cmdArgs instanceof CommandArguments) {
            msg = await cmdArgs.reply("leaderboard.generate");
        }

        recentLeaderboard.users.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, recentLeaderboard.users);

        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (index < 0) {
            const i = recentLeaderboard.users.findIndex(u => u.userId === user.id);
            if (i >= 0) {
                leaderboardLevels.push({ userLevel: recentLeaderboard.users[i], member, position: i });
            } else {
                return cmdArgs.reply("error.null.userLevel");
            }
        }

        const leaderBoard = await drawLeaderboard(leaderboardLevels, user, cmdArgs.guildId, "Weekly");

        cmdArgs.reply({ files: [canvasToMessageAttachment(leaderBoard, "leaderboard")] });

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }
}
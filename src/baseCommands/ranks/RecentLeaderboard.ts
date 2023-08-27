import { Message } from "discord.js";
import { CommandArguments } from "../../structs/Command";
import { drawLeaderboard } from "../../utils/CardUtils";
import { getUserFromMention, getMemberById } from "../../utils/GetterUtils";
import { getLeaderboardMembers, canvasToMessageAttachment, getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { WeeklyLeaderboard } from "../../structs/databaseTypes/WeeklyLeaderboard";
import { WEEKLY_TIME } from "../../Constants";
import { dateToString } from "../../utils/FormatUtils";

export class WeeklyLeaderboardBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const recentLeaderboard = await getOneDatabase(WeeklyLeaderboard, { guildId: cmdArgs.guildId }, () => new WeeklyLeaderboard({ guildId: cmdArgs.guildId }));
        if (!recentLeaderboard.document.levels.length) return cmdArgs.reply("error.empty.levels");

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

        {
            const i = recentLeaderboard.document.levels.findIndex(u => u.userId === user.id);
            if (i < 0) {
                recentLeaderboard.document.levels.push({ userId: user.id, xp: 0, level: 0 });
                await recentLeaderboard.save();
            }
        }

        recentLeaderboard.document.levels.sort((a, b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            }
            return b.level - a.level;
        });

        const leaderboardLevels = await getLeaderboardMembers(cmdArgs.guild, recentLeaderboard.document.levels);

        const index = leaderboardLevels.findIndex(u => u.userLevel.userId === user.id);
        if (index < 0) {
            const i = recentLeaderboard.document.levels.findIndex(u => u.userId === user.id);
            if (i >= 0) {
                leaderboardLevels.push({ userLevel: recentLeaderboard.document.levels[i], member, position: i });
            } else {
                return cmdArgs.reply("error.null.userLevel");
            }
        }

        const startDate = recentLeaderboard.document.startDate;
        const endDate = new Date(recentLeaderboard.document.startDate.getTime() + WEEKLY_TIME);

        const leaderBoard = await drawLeaderboard(leaderboardLevels, user, cmdArgs.guildId, `Weekly ${dateToString(startDate, "{dd}/{MM}/{YYYY}")} - ${dateToString(endDate, "{dd}/{MM}/{YYYY}")}`);

        cmdArgs.reply({ files: [canvasToMessageAttachment(leaderBoard, "leaderboard")] });

        if (cmdArgs instanceof CommandArguments) {
            msg.delete();
        }
    }
}
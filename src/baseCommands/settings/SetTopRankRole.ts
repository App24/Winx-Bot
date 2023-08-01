import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RecentLeaderboardData } from "../../structs/databaseTypes/RecentLeaderboard";
import { getRoleFromMention } from "../../utils/GetterUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SetTopRankRoleBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const RecentLeaderboard = BotUser.getDatabase(DatabaseType.RecentLeaderboard);
        const recentLeaderboard: RecentLeaderboardData = await getServerDatabase(RecentLeaderboard, cmdArgs.guildId, new RecentLeaderboardData());

        const role = await getRoleFromMention(cmdArgs.args[0], cmdArgs.guild);

        if (!role) {
            return cmdArgs.reply("error.invalid.role");
        }

        recentLeaderboard.topRoleId = role.id;

        await RecentLeaderboard.set(cmdArgs.guildId, recentLeaderboard);

        cmdArgs.reply("generic.done");
    }
}
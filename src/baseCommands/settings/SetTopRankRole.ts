import { WeeklyLeaderboard } from "../../structs/databaseTypes/WeeklyLeaderboard";
import { getRoleFromMention } from "../../utils/GetterUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class SetTopRankRoleBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const recentLeaderboard = await getOneDatabase(WeeklyLeaderboard, { guildId: cmdArgs.guildId }, () => new WeeklyLeaderboard({ guildId: cmdArgs.guildId }));

        const role = await getRoleFromMention(cmdArgs.args[0], cmdArgs.guild);

        if (!role) {
            return cmdArgs.reply("error.invalid.role");
        }

        recentLeaderboard.document.topRoleId = role.id;

        await recentLeaderboard.save();

        cmdArgs.reply("generic.done");
    }
}
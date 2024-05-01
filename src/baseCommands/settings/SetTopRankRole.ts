import { WeeklyLeaderboard } from "../../structs/databaseTypes/WeeklyLeaderboard";
import { getRoleFromMention } from "../../utils/GetterUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class SetTopRankRoleBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

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
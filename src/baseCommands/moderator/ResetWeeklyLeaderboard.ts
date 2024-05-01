import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { resetWeeklyLeaderboard } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ResetWeeklyLeaderboardBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        resetWeeklyLeaderboard(cmdArgs.guild);
        cmdArgs.reply("generic.done");
    }
}
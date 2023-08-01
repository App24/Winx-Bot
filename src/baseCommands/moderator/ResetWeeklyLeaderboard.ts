import { resetWeeklyLeaderboard } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class ResetWeeklyLeaderboardBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        resetWeeklyLeaderboard(cmdArgs.guild);
        cmdArgs.reply("generic.done");
    }
}
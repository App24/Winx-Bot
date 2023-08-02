import { showWeeklyLeaderboardMessage } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class TestWeeklyBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        await showWeeklyLeaderboardMessage(cmdArgs.guild);
    }
}
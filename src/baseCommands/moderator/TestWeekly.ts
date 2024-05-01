import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { showWeeklyLeaderboardMessage } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class TestWeeklyBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        await showWeeklyLeaderboardMessage(cmdArgs.guild);
    }
}
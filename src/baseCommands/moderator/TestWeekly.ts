import { BaseGuildTextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getRoleById } from "../../utils/GetterUtils";
import { applyWeeklyLeaderboard, getServerDatabase, showWeeklyLeaderboardMessage } from "../../utils/Utils";
import { showLevelMessage } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class TestWeeklyBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        await showWeeklyLeaderboardMessage(cmdArgs.guild);
    }
}
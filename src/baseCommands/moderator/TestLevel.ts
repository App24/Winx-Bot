import { BaseGuildTextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getRoleById } from "../../utils/GetterUtils";
import { getServerDatabase } from "../../utils/Utils";
import { showLevelMessage } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class TestLevelBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.reply("error.invalid.level");
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
        const rankLevel = ranks.find(rank => rank.level === level);
        let rankDetails;
        if (rankLevel) {
            const rank = await getRoleById(rankLevel.roleId, cmdArgs.guild);
            if (rank) {
                rankDetails = { rankLevel, rank };
            }
        }
        showLevelMessage(true, <BaseGuildTextChannel>cmdArgs.channel, cmdArgs.member, level, rankDetails);
    }
}
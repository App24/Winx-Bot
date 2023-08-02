import { BaseGuildTextChannel, Role } from "discord.js";
import { RankLevel, RankLevelData } from "../../structs/databaseTypes/RankLevel";
import { getRoleById } from "../../utils/GetterUtils";
import { getOneDatabase } from "../../utils/Utils";
import { showLevelMessage } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class TestLevelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.reply("error.invalid.level");
        const rankLevel = await getOneDatabase(RankLevel, { guildId: cmdArgs.guildId, level });
        let rankDetails: { rankLevel: RankLevelData, rank: Role };
        if (rankLevel) {
            const rank = await getRoleById(rankLevel.roleId, cmdArgs.guild);
            if (rank) {
                rankDetails = { rankLevel: rankLevel.toObject(), rank };
            }
        }
        showLevelMessage(true, <BaseGuildTextChannel>cmdArgs.channel, cmdArgs.member, level, rankDetails);
    }
}
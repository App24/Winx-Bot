import { BaseGuildTextChannel, Role } from "discord.js";
import { RankLevel, RankLevelData } from "../../structs/databaseTypes/RankLevel";
import { getRoleById } from "../../utils/GetterUtils";
import { getOneDatabase } from "../../utils/Utils";
import { showLevelMessage } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ModelWrapper } from "../../structs/ModelWrapper";

export class TestLevelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.reply("error.invalid.level");
        const rankLevel = await getOneDatabase(RankLevel, { guildId: cmdArgs.guildId, level });
        let rankDetails: { rankLevel: ModelWrapper<typeof RankLevel.schema>, rank: Role };
        if (!rankLevel.isNull()) {
            const role = await getRoleById(rankLevel.document.roleId, cmdArgs.guild);
            if (role) {
                rankDetails = { rankLevel: rankLevel, rank: role };
            }
        }
        showLevelMessage(true, <BaseGuildTextChannel>cmdArgs.channel, cmdArgs.member, level, rankDetails);
    }
}
import { BotUser } from "../../BotClient";
import { getRoleById } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { getServerDatabase } from "../../utils/Utils";
import { showLevelMessage } from "../../utils/XPUtils";
import { BaseGuildTextChannel } from "discord.js";

class TestLevelCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.usage = [new CommandUsage(true, "argument.level")];
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
        this.cooldown = 0;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level) || level < 0) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);
        const rankLevel = ranks.find(rank => rank.level === level);
        let rankDetails;
        if (rankLevel) {
            const rank = await getRoleById(rankLevel.roleId, cmdArgs.guild);
            if (rank) {
                rankDetails = { rankLevel: rankLevel, rank: rank };
            }
        }
        showLevelMessage(true, <BaseGuildTextChannel>cmdArgs.channel, cmdArgs.member, level, rankDetails);
    }
}

export = TestLevelCommand;
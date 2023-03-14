import { BaseGuildTextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "../../utils/Utils";
import { getLevelXP, addXP } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class GiveXPBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        let userLevel = levels.find(u => u.userId === cmdArgs.author.id);
        if (!userLevel) {
            await levels.push(new UserLevel(cmdArgs.author.id));
            userLevel = levels.find(u => u.userId === cmdArgs.author.id);
        }
        const level = Math.max(1, Math.abs(userLevel.level));
        const per = Math.pow(level, -1.75);
        const rand = Math.random();
        if (rand <= per) {
            const xp = Math.floor(getLevelXP(userLevel.level) * 0.1);
            await addXP({ xp, member: cmdArgs.member, guild: cmdArgs.guild, channel: <BaseGuildTextChannel>cmdArgs.channel });
            return cmdArgs.reply("givexp.success.output", xp);
        }
        cmdArgs.reply("givexp.fail.output");
    }
}
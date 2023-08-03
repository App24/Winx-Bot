import { BaseGuildTextChannel } from "discord.js";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getOneDatabase } from "../../utils/Utils";
import { getLevelXP, addXP } from "../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class GiveXPBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const userLevel = await getOneDatabase(UserLevel, { guildId: cmdArgs.guildId, "levelData.userId": cmdArgs.author.id }, () => new UserLevel({ guildId: cmdArgs.guildId, levelData: { userId: cmdArgs.author.id } }));
        const level = Math.max(1, Math.abs(userLevel.document.levelData.level));
        const per = Math.pow(level, -1.75);
        const rand = Math.random();
        if (rand <= per) {
            const xp = Math.floor(getLevelXP(userLevel.document.levelData.level) * 0.1);
            await addXP({ xp, member: cmdArgs.member, guild: cmdArgs.guild, channel: <BaseGuildTextChannel>cmdArgs.channel });
            return cmdArgs.reply("givexp.success.output", xp);
        }
        cmdArgs.reply("givexp.fail.output");
    }
}
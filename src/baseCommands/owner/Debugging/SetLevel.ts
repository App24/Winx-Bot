import { BotUser } from "../../../BotClient";
import { DatabaseType } from "../../../structs/DatabaseTypes";
import { UserLevel } from "../../../structs/databaseTypes/UserLevel";
import { getMemberById } from "../../../utils/GetterUtils";
import { getServerDatabase } from "../../../utils/Utils";
import { getLevelXP } from "../../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";

export class SetLevelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const member = await getMemberById("598199612289056769", cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");
        if (member.user.bot) return cmdArgs.reply("error.user.bot");
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level)) return cmdArgs.reply("error.invalid.level");
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        let userLevel = levels.find(user => user.userId === member.id);
        if (!userLevel) {
            levels.push(new UserLevel(member.id));
            userLevel = levels.find(user => user.userId === member.id);
        }
        const index = levels.indexOf(userLevel);
        let xp = Math.round((userLevel.xp / getLevelXP(userLevel.level)) * getLevelXP(level));
        if (cmdArgs.args[1]) {
            xp = parseInt(cmdArgs.args[1]);
            if (isNaN(xp) || xp < 0 || xp >= getLevelXP(level)) return cmdArgs.reply("error.invalid.xp");
        }
        console.log(userLevel.level);
        console.log(userLevel.xp);
        userLevel.level = level;
        userLevel.xp = xp;
        levels[index] = userLevel;
        await Levels.set(cmdArgs.guildId, levels);
        cmdArgs.reply("setlevel.output", member, level, xp);
    }
}
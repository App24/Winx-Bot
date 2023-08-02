import { UserLevel } from "../../../structs/databaseTypes/UserLevel";
import { getMemberById } from "../../../utils/GetterUtils";
import { getOneDatabase } from "../../../utils/Utils";
import { getLevelXP } from "../../../utils/XPUtils";
import { BaseCommand, BaseCommandType } from "../../BaseCommand";

export class SetLevelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const member = await getMemberById("598199612289056769", cmdArgs.guild);
        if (!member) return cmdArgs.reply("error.invalid.member");
        if (member.user.bot) return cmdArgs.reply("error.user.bot");
        const level = parseInt(cmdArgs.args[0]);
        if (isNaN(level)) return cmdArgs.reply("error.invalid.level");
        const userLevel = await getOneDatabase(UserLevel, { guildId: cmdArgs.guildId, "levelData.userId": cmdArgs.author.id }, () => new UserLevel({ guildId: cmdArgs.guildId, levelData: { userId: cmdArgs.author.id } }));

        let xp = Math.round((userLevel.levelData.xp / getLevelXP(userLevel.levelData.level)) * getLevelXP(level));
        if (cmdArgs.args[1]) {
            xp = parseInt(cmdArgs.args[1]);
            if (isNaN(xp) || xp < 0 || xp >= getLevelXP(level)) return cmdArgs.reply("error.invalid.xp");
        }
        console.log(userLevel.levelData.level);
        console.log(userLevel.levelData.xp);
        userLevel.levelData.level = level;
        userLevel.levelData.xp = xp;

        await userLevel.save();
        cmdArgs.reply("setlevel.output", member, level, xp);
    }
}
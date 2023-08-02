import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { asyncForEach, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CheckBansBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const levels = await getDatabase(UserLevel, { guildId: cmdArgs.guildId });
        if (!levels.length) return cmdArgs.reply("error.empty.levels");
        const bans = await cmdArgs.guild.bans.fetch();
        let amount = 0;
        bans.forEach(ban => {
            const index = levels.findIndex(u => u.levelData.userId === ban.user.id);
            if (index > -1) {
                levels.splice(index, 1);
                amount++;
            }
        });
        await asyncForEach(levels, async (level) => {
            await level.save();
        });
        cmdArgs.reply("checkbans.bans", amount);
    }
}
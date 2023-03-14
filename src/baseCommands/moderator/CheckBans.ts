import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CheckBansBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        if (!levels.length) return cmdArgs.reply("error.empty.levels");
        const bans = await cmdArgs.guild.bans.fetch();
        let amount = 0;
        bans.forEach(ban => {
            const index = levels.findIndex(u => u.userId === ban.user.id);
            if (index > -1) {
                levels.splice(index, 1);
                amount++;
            }
        });
        await Levels.set(cmdArgs.guildId, levels);
        cmdArgs.reply("checkbans.bans", amount);
    }
}
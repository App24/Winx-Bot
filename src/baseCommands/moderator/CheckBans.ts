import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { asyncMapForEach, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CheckBansBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const levels = await getDatabase(UserLevel, { guildId: cmdArgs.guildId });
        if (!levels.length) return cmdArgs.reply("error.empty.levels");
        await cmdArgs.localisedReply("Checking");
        const bans = await cmdArgs.guild.bans.fetch();
        let amount = 0;
        await asyncMapForEach(bans, async (_, ban) => {
            const index = levels.findIndex(u => u.document.levelData.userId === ban.user.id);
            if (index > -1) {
                await UserLevel.deleteOne({ guildId: cmdArgs.guildId, "levelData.userId": ban.user.id });
                amount++;
            }
        });
        cmdArgs.reply("checkbans.bans", amount);
    }
}
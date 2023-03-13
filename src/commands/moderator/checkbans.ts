import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Moderator } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "../../utils/Utils";
import { CheckBansBaseCommand } from "../../baseCommands/moderator/CheckBans";

class CheckBansCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new CheckBansBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const Levels = BotUser.getDatabase(DatabaseType.Levels);
    //     const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
    //     if (!levels.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));
    //     const bans = await cmdArgs.guild.bans.fetch();
    //     let amount = 0;
    //     bans.forEach(ban => {
    //         const index = levels.findIndex(u => u.userId === ban.user.id);
    //         if (index > -1) {
    //             levels.splice(index, 1);
    //             amount++;
    //         }
    //     });
    //     await Levels.set(cmdArgs.guildId, levels);
    //     cmdArgs.message.reply(Localisation.getTranslation("checkbans.bans", amount));
    // }
}

export = CheckBansCommand;
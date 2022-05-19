import { BaseGuildTextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getServerDatabase } from "../../utils/Utils";
import { addXP, getLevelXP } from "../../utils/XPUtils";

class GiveXPCommand extends Command {
    constructor() {
        super();
        this.cooldown = 60 * 5;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: CommandArguments) {
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
            return cmdArgs.message.reply(Localisation.getTranslation("givexp.success.output", xp));
        }
        cmdArgs.message.reply(Localisation.getTranslation("givexp.fail.output"));
    }
}

export = GiveXPCommand;
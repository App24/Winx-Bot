import { Owner } from "../../../structs/Category";
import { Command, CommandUsage } from "../../../structs/Command";
import { CommandAvailable } from "../../../structs/CommandAvailable";
import { CommandAccess } from "../../../structs/CommandAccess";
import { SetLevelBaseCommand } from "../../../baseCommands/owner/Debugging/SetLevel";

class SetLevelCommand extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;
        this.available = CommandAvailable.Guild;
        this.usage = [new CommandUsage(true, "argument.level"), new CommandUsage(false, "argument.xp")];

        this.baseCommand = new SetLevelBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const member = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
    //     if (!member) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.member"));
    //     if (member.user.bot) return cmdArgs.message.reply(Localisation.getTranslation("error.user.bot"));
    //     const level = parseInt(cmdArgs.args[1]);
    //     if (isNaN(level)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.level"));
    //     const Levels = BotUser.getDatabase(DatabaseType.Levels);
    //     const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
    //     let userLevel = levels.find(user => user.userId === member.id);
    //     if (!userLevel) {
    //         levels.push(new UserLevel(member.id));
    //         userLevel = levels.find(user => user.userId === member.id);
    //     }
    //     const index = levels.indexOf(userLevel);
    //     let xp = Math.round((userLevel.xp / getLevelXP(userLevel.level)) * getLevelXP(level));
    //     if (cmdArgs.args[2]) {
    //         xp = parseInt(cmdArgs.args[2]);
    //         if (isNaN(xp) || xp < 0 || xp >= getLevelXP(level)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.xp"));
    //     }
    //     userLevel.level = level;
    //     userLevel.xp = xp;
    //     levels[index] = userLevel;
    //     await Levels.set(cmdArgs.guildId, levels);
    //     cmdArgs.message.reply(Localisation.getTranslation("setlevel.output", member, level, xp));
    // }
}

export = SetLevelCommand;
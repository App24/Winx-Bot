import { Moderator } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { CheckRanksBaseCommand } from "../../baseCommands/moderator/CheckRanks";

class CheckRanksCommand extends Command {
    public constructor() {
        super();
        this.category = Moderator;
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new CheckRanksBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const Levels = BotUser.getDatabase(DatabaseType.Levels);
    //     const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    //     const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
    //     const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);

    //     if (!levels.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levels"));
    //     if (!ranks.length) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.ranks"));

    //     const members = await cmdArgs.guild.members.fetch().then(promise => Array.from(promise.values()));
    //     await cmdArgs.message.reply(Localisation.getTranslation("checkranks.start"));
    //     await asyncForEach(members, async (member: GuildMember) => {
    //         const user = levels.find(u => u.userId === member.id);
    //         if (user) {
    //             await asyncForEach(ranks, async (rank: RankLevel) => {
    //                 const role = await getRoleById(rank.roleId, cmdArgs.guild);
    //                 if (!role) return;
    //                 if (user.level >= rank.level && !member.roles.cache.has(role.id)) {
    //                     await member.roles.add(role);
    //                 } else if (user.level < rank.level && member.roles.cache.has(role.id)) {
    //                     await member.roles.remove(role);
    //                 }
    //             });
    //         }
    //     });
    //     cmdArgs.message.reply(Localisation.getTranslation("generic.done"));
    // }
}

export = CheckRanksCommand;
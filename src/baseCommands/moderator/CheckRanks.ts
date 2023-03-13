import { GuildMember } from "discord.js";
import { BotUser } from "../../BotClient";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getRoleById } from "../../utils/GetterUtils";
import { getServerDatabase, asyncForEach } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CheckRanksBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const Levels = BotUser.getDatabase(DatabaseType.Levels);
        const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
        const levels: UserLevel[] = await getServerDatabase(Levels, cmdArgs.guildId);
        const ranks: RankLevel[] = await getServerDatabase(Ranks, cmdArgs.guildId);

        if (!levels.length) return cmdArgs.reply("error.empty.levels");
        if (!ranks.length) return cmdArgs.reply("error.empty.ranks");

        const members = await cmdArgs.guild.members.fetch().then(promise => Array.from(promise.values()));
        await cmdArgs.reply("checkranks.start");
        await asyncForEach(members, async (member: GuildMember) => {
            const user = levels.find(u => u.userId === member.id);
            if (user) {
                await asyncForEach(ranks, async (rank: RankLevel) => {
                    const role = await getRoleById(rank.roleId, cmdArgs.guild);
                    if (!role) return;
                    if (user.level >= rank.level && !member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                    } else if (user.level < rank.level && member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                    }
                });
            }
        });
        cmdArgs.reply("generic.done");
    }
}
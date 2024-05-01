import { GuildMember } from "discord.js";
import { RankLevel } from "../../structs/databaseTypes/RankLevel";
import { UserLevel } from "../../structs/databaseTypes/UserLevel";
import { getRoleById } from "../../utils/GetterUtils";
import { asyncForEach, getDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";

export class CheckRanksBaseCommand extends BaseCommand {
    public constructor() {
        super();
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const levels = await getDatabase(UserLevel, { guildId: cmdArgs.guildId });
        const ranks = await getDatabase(RankLevel, { guildId: cmdArgs.guildId });

        if (!levels.length) return cmdArgs.reply("error.empty.levels");
        if (!ranks.length) return cmdArgs.reply("error.empty.ranks");

        const members = await cmdArgs.guild.members.fetch().then(promise => Array.from(promise.values()));
        await cmdArgs.reply("checkranks.start");
        await asyncForEach(members, async (member: GuildMember) => {
            const user = levels.find(u => u.document.levelData.userId === member.id);
            if (user) {
                await asyncForEach(ranks, async (rank) => {
                    const role = await getRoleById(rank.document.roleId, cmdArgs.guild);
                    if (!role) return;
                    if (user.document.levelData.level >= rank.document.level && !member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                    } else if (user.document.levelData.level < rank.document.level && member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                    }
                });
            }
        });
        cmdArgs.reply("generic.done");
    }
}
import { GuildMember } from "discord.js";
import { BotUser } from "../BotClient";
import { getRoleById } from "../utils/GetterUtils";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { asyncForEach, getDatabase } from "../utils/Utils";

export = () => {
    BotUser.on("guildMemberAdd", async (member: GuildMember) => {
        const levels = await getDatabase(UserLevel, { guildId: member.guild.id });
        const ranks = await getDatabase(RankLevel, { guildId: member.guild.id });
        if (!levels.length || !ranks.length) return;
        const user = levels.find(u => u.levelData.userId === member.id);
        if (user) {
            await asyncForEach(ranks, async (rank) => {
                const role = await getRoleById(rank.roleId, member.guild);
                if (!role) return;
                if (user.levelData.level >= rank.level && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                } else if (user.levelData.level < rank.level && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                }
            });
        }
    });
};
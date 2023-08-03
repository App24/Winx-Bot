import { GuildMember } from "discord.js";
import { BotUser } from "../BotClient";
import { getRoleById } from "../utils/GetterUtils";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { asyncForEach, getDatabase, getOneDatabase, reportBotError } from "../utils/Utils";

export = () => {
    BotUser.on("guildMemberAdd", async (member: GuildMember) => {
        try {
            const ranks = await getDatabase(RankLevel, { guildId: member.guild.id });
            if (!ranks.length) return;
            const user = await getOneDatabase(UserLevel, { guildId: member.guild.id, "levelData.userId": member.id });
            if (!user.isNull()) {
                await asyncForEach(ranks, async (rank) => {
                    const role = await getRoleById(rank.document.roleId, member.guild);
                    if (!role) return;
                    if (user.document.levelData.level >= rank.document.level && !member.roles.cache.has(role.id)) {
                        await member.roles.add(role);
                    } else if (user.document.levelData.level < rank.document.level && member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                    }
                });
            }
        } catch (error) {
            reportBotError(error.stack);
        }
    });
};
import { BaseGuildTextChannel, BaseMessageOptions, Guild, GuildMember, Role } from "discord.js";
import { getMemberById, getRoleById, getTextChannelById } from "./GetterUtils";
import { Localisation } from "../localisation";
import { RankLevel, RankLevelData } from "../structs/databaseTypes/RankLevel";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { getOneDatabase, getLeaderboardMembers, getDatabase } from "./Utils";
import { capitalise } from "./FormatUtils";
import { getServerUserSettings } from "./RankUtils";
import { ServerData } from "../structs/databaseTypes/ServerData";
import { WeeklyLeaderboard } from "../structs/databaseTypes/WeeklyLeaderboard";
import { LevelData } from "../structs/databaseTypes/LevelData";

export interface XPInfo {
    readonly xp: number;
    readonly member: GuildMember;
    readonly guild: Guild;
    readonly channel: BaseGuildTextChannel;
}

/**
 * Get the amount of xp required for a certain level based on a formula
 * @param level 
 * @returns Amount of xp this level needs
 */
export function getLevelXP(level: number) {
    return Math.abs(level) * 2 * 75 + 50;
}

export async function removeXP(xpInfo: XPInfo) {
    const ranks = await getDatabase(RankLevel, { guildId: xpInfo.guild.id });

    const serverInfo = await getOneDatabase(ServerData, { guildId: xpInfo.guild.id }, () => new ServerData({ guildId: xpInfo.guild.id }));

    const userLevel = await getOneDatabase(UserLevel, { guildId: xpInfo.guild.id, "levelData.userId": xpInfo.member.id }, () => new UserLevel({ guildId: xpInfo.guild.id, levelData: { userId: xpInfo.member.id } }));

    userLevel.levelData.xp -= xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.levelChannel) {
        const temp = await getTextChannelById(serverInfo.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    while (userLevel.levelData.xp < 0) {
        if (userLevel.levelData.level <= 0) {
            userLevel.levelData.xp = 0;
            break;
        }
        userLevel.levelData.level--;
        userLevel.levelData.xp += getLevelXP(userLevel.levelData.level);
        let rankDetails: { rankLevel: RankLevelData, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.level === userLevel.levelData.level + 1);
            if (rankLevel) {
                const rank = await getRoleById(rankLevel.roleId, xpInfo.guild);
                if (rank) {
                    if (xpInfo.member.roles.cache.has(rank.id))
                        await xpInfo.member.roles.remove(rank, "lost transformation").catch(console.error);
                    rankDetails = { rankLevel: rankLevel.toObject(), rank };
                }
            }
        }
        await showLevelMessage(false, levelChannel, xpInfo.member, userLevel.levelData.level, rankDetails);
    }

    await userLevel.save();
}

export async function addXP(xpInfo: XPInfo, levelUpMessage = true, fromMessage = false) {
    const ranks = await getDatabase(RankLevel, { guildId: xpInfo.guild.id });

    const serverInfo = await getOneDatabase(ServerData, { guildId: xpInfo.guild.id }, () => new ServerData({ guildId: xpInfo.guild.id }));

    //await checkWeeklyLeaderboard(xpInfo.member.guild);
    const recentLeaderboard = await getOneDatabase(WeeklyLeaderboard, { guildId: xpInfo.guild.id }, () => new WeeklyLeaderboard({ guildId: xpInfo.guild.id }));

    let user = recentLeaderboard.levels.find(u => u.userId === xpInfo.member.user.id);
    if (!user) {
        recentLeaderboard.levels.push({ userId: xpInfo.member.user.id, xp: 0, level: 0 });
        user = recentLeaderboard.levels[recentLeaderboard.levels.length - 1];
    }

    const member = await getMemberById(xpInfo.member.id, xpInfo.guild);
    if (!member) return;

    const userLevel = await getOneDatabase(UserLevel, { guildId: xpInfo.guild.id, "levelData.userId": xpInfo.member.id }, () => new UserLevel({ guildId: xpInfo.guild.id, levelData: { userId: xpInfo.member.id } }));

    userLevel.levelData.xp += xpInfo.xp;
    user.xp += xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.levelChannel) {
        const temp = await getTextChannelById(serverInfo.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    if (fromMessage) {
        while (user.xp >= getLevelXP(user.level)) {
            user.xp -= getLevelXP(user.level);
            user.level++;
        }
    }

    while (userLevel.levelData.xp >= getLevelXP(userLevel.levelData.level)) {
        userLevel.levelData.xp -= getLevelXP(userLevel.levelData.level);
        userLevel.levelData.level++;
        let rankDetails: { rankLevel: RankLevelData, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.level === userLevel.levelData.level);
            if (rankLevel) {
                const rank = await getRoleById(rankLevel.roleId, xpInfo.guild);
                if (rank) {
                    if (!member.roles.cache.has(rank.id))
                        member.roles.add(rank).catch(console.error);
                    rankDetails = { rankLevel: rankLevel.toObject(), rank };
                }
            }
        }
        if (levelUpMessage)
            await showLevelMessage(true, levelChannel, xpInfo.member, userLevel.levelData.level, rankDetails);
    }

    await userLevel.save();
    await recentLeaderboard.save();
}

export async function showLevelMessage(levelUp: boolean, levelChannel: BaseGuildTextChannel, member: GuildMember, level: number, rankDetails: { rankLevel: RankLevelData, rank: Role }) {
    const userSettings = await getServerUserSettings(member.id, levelChannel.guildId);

    if (userSettings.levelPing === undefined) {
        userSettings.levelPing = false;
    }

    const options: BaseMessageOptions = {
        content: Localisation.getTranslation(levelUp ? "xp.level.up" : "xp.level.down", member, level)
    };

    if (userSettings.levelPing) {
        options.allowedMentions = { users: [member.id] };
    }

    await levelChannel.send(options);
    if (rankDetails) {
        await levelChannel.send(Localisation.getTranslation(levelUp ? "xp.transformation.earn" : "xp.transformation.lost", member, capitalise(rankDetails.rank.name)));
        if (rankDetails.rankLevel.gifs && rankDetails.rankLevel.gifs.length) {
            await levelChannel.send(rankDetails.rankLevel.gifs[Math.floor(Math.random() * rankDetails.rankLevel.gifs.length)]);
        }
    }
}

export async function getLeaderboardPosition(member: GuildMember) {
    const levels = await getDatabase(UserLevel, { guildId: member.guild.id });

    return getLeaderboardPositionFromList(member, levels.map(l => l.levelData));
}

export async function getWeeklyLeaderboardPosition(member: GuildMember) {

    const recentLeaderboard = await getOneDatabase(WeeklyLeaderboard, { guildId: member.guild.id }, () => new WeeklyLeaderboard({ guildId: member.guild.id }));

    return getLeaderboardPositionFromList(member, recentLeaderboard.levels.toObject());
}

export async function getLeaderboardPositionFromList(member: GuildMember, levels: LevelData[]) {
    levels.sort((a, b) => {
        if (a.level === b.level) {
            return b.xp - a.xp;
        }
        return b.level - a.level;
    });

    const leaderboardLevels = await getLeaderboardMembers(member.guild, levels);
    let leaderboardPosition = leaderboardLevels.findIndex(u => u.userLevel.userId === member.id);
    if (leaderboardPosition < 0) {
        leaderboardPosition = levels.findIndex(u => u.userId === member.id);
    }
    return leaderboardPosition;
}
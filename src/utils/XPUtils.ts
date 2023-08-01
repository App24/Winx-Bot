import { BaseGuildTextChannel, BaseMessageOptions, Guild, GuildMember, Role } from "discord.js";
import { BotUser } from "../BotClient";
import { getMemberById, getRoleById, getTextChannelById } from "./GetterUtils";
import { Localisation } from "../localisation";
import { DatabaseType } from "../structs/DatabaseTypes";
import { RankLevel } from "../structs/databaseTypes/RankLevel";
import { DEFAULT_SERVER_INFO, ServerData } from "../structs/databaseTypes/ServerInfo";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { checkWeeklyLeaderboard, getLeaderboardMembers, getServerDatabase } from "./Utils";
import { capitalise } from "./FormatUtils";
import { getServerUserSettings } from "./RankUtils";
import { RecentLeaderboardData } from "../structs/databaseTypes/RecentLeaderboard";

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
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo: ServerData = await getServerDatabase(ServerInfo, xpInfo.guild.id, DEFAULT_SERVER_INFO);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, xpInfo.guild.id);
    const levels: UserLevel[] = await getServerDatabase(Levels, xpInfo.guild.id);

    let userLevel = levels.find(u => u.userId === xpInfo.member.id);
    if (!userLevel) {
        levels.push(new UserLevel(xpInfo.member.id));
        userLevel = levels.find(u => u.userId === xpInfo.member.id);
    }

    userLevel.xp -= xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.levelChannel) {
        const temp = await getTextChannelById(serverInfo.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    while (userLevel.xp < 0) {
        if (userLevel.level <= 0) {
            userLevel.xp = 0;
            break;
        }
        userLevel.level--;
        userLevel.xp += getLevelXP(userLevel.level);
        let rankDetails: { rankLevel: RankLevel, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.level === userLevel.level + 1);
            if (rankLevel) {
                const rank = await getRoleById(rankLevel.roleId, xpInfo.guild);
                if (rank) {
                    if (xpInfo.member.roles.cache.has(rank.id))
                        await xpInfo.member.roles.remove(rank, "lost transformation").catch(console.error);
                    rankDetails = { rankLevel, rank };
                }
            }
        }
        await showLevelMessage(false, levelChannel, xpInfo.member, userLevel.level, rankDetails);
    }

    await Levels.set(xpInfo.guild.id, levels);
}

export async function addXP(xpInfo: XPInfo, levelUpMessage = true, fromMessage = false) {
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const Ranks = BotUser.getDatabase(DatabaseType.Ranks);
    const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);

    const serverInfo: ServerData = await getServerDatabase(ServerInfo, xpInfo.guild.id, DEFAULT_SERVER_INFO);
    const ranks: RankLevel[] = await getServerDatabase(Ranks, xpInfo.guild.id);
    const levels: UserLevel[] = await getServerDatabase(Levels, xpInfo.guild.id);

    //await checkWeeklyLeaderboard(xpInfo.member.guild);

    const RecentLeaderboard = BotUser.getDatabase(DatabaseType.RecentLeaderboard);
    const recentLeaderboard: RecentLeaderboardData = await getServerDatabase(RecentLeaderboard, xpInfo.member.guild.id, new RecentLeaderboardData());

    let user = recentLeaderboard.users.find(u => u.userId === xpInfo.member.user.id);
    if (!user) {
        recentLeaderboard.users.push({ userId: xpInfo.member.user.id, xp: 0, level: 0 });
        user = recentLeaderboard.users[recentLeaderboard.users.length - 1];
    }

    const member = await getMemberById(xpInfo.member.id, xpInfo.guild);
    if (!member) return;

    let userLevel = levels.find(u => u.userId === xpInfo.member.id);
    if (!userLevel) {
        levels.push(new UserLevel(xpInfo.member.id));
        userLevel = levels.find(u => u.userId === xpInfo.member.id);
    }

    userLevel.xp += xpInfo.xp;
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

    while (userLevel.xp >= getLevelXP(userLevel.level)) {
        userLevel.xp -= getLevelXP(userLevel.level);
        userLevel.level++;
        let rankDetails: { rankLevel: RankLevel, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.level === userLevel.level);
            if (rankLevel) {
                const rank = await getRoleById(rankLevel.roleId, xpInfo.guild);
                if (rank) {
                    if (!member.roles.cache.has(rank.id))
                        member.roles.add(rank).catch(console.error);
                    rankDetails = { rankLevel, rank };
                }
            }
        }
        if (levelUpMessage)
            await showLevelMessage(true, levelChannel, xpInfo.member, userLevel.level, rankDetails);
    }

    await Levels.set(xpInfo.guild.id, levels);
    await RecentLeaderboard.set(xpInfo.guild.id, recentLeaderboard);
}

export async function showLevelMessage(levelUp: boolean, levelChannel: BaseGuildTextChannel, member: GuildMember, level: number, rankDetails: { rankLevel: RankLevel, rank: Role }) {
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
    const Levels = BotUser.getDatabase(DatabaseType.Levels);
    const levels: UserLevel[] = await getServerDatabase(Levels, member.guild.id);

    return getLeaderboardPositionFromList(member, levels);
}

export async function getWeeklyLeaderboardPosition(member: GuildMember) {

    const RecentLeaderboard = BotUser.getDatabase(DatabaseType.RecentLeaderboard);
    const recentLeaderboard: RecentLeaderboardData = await getServerDatabase(RecentLeaderboard, member.guild.id, new RecentLeaderboardData());

    return getLeaderboardPositionFromList(member, recentLeaderboard.users);
}

export async function getLeaderboardPositionFromList(member: GuildMember, levels: UserLevel[]) {
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
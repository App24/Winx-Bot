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
import { ModelWrapper } from "../structs/ModelWrapper";

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

    userLevel.document.levelData.xp -= xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.document.levelChannel) {
        const temp = await getTextChannelById(serverInfo.document.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    while (userLevel.document.levelData.xp < 0) {
        if (userLevel.document.levelData.level <= 0) {
            userLevel.document.levelData.xp = 0;
            break;
        }
        userLevel.document.levelData.level--;
        userLevel.document.levelData.xp += getLevelXP(userLevel.document.levelData.level);
        let rankDetails: { rankLevel: ModelWrapper<typeof RankLevel.schema>, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.document.level === userLevel.document.levelData.level + 1);
            if (rankLevel && !rankLevel.isNull()) {
                const rank = await getRoleById(rankLevel.document.roleId, xpInfo.guild);
                if (rank) {
                    if (xpInfo.member.roles.cache.has(rank.id))
                        await xpInfo.member.roles.remove(rank, "lost transformation").catch(console.error);
                    rankDetails = { rankLevel, rank };
                }
            }
        }
        await showLevelMessage(false, levelChannel, xpInfo.member, userLevel.document.levelData.level, rankDetails);
    }

    await userLevel.save();
}

export async function addXP(xpInfo: XPInfo, levelUpMessage = true, fromMessage = false) {
    const member = await getMemberById(xpInfo.member.id, xpInfo.guild);
    if (!member) return;

    const ranks = await getDatabase(RankLevel, { guildId: xpInfo.guild.id });

    const serverInfo = await getOneDatabase(ServerData, { guildId: xpInfo.guild.id }, () => new ServerData({ guildId: xpInfo.guild.id }));

    //await checkWeeklyLeaderboard(xpInfo.member.guild);
    const recentLeaderboard = await getOneDatabase(WeeklyLeaderboard, { guildId: xpInfo.guild.id }, () => new WeeklyLeaderboard({ guildId: xpInfo.guild.id }));

    let user = recentLeaderboard.document.levels.find(u => u.userId === xpInfo.member.user.id);
    if (!user) {
        recentLeaderboard.document.levels.push({ userId: xpInfo.member.user.id, xp: 0, level: 0 });
        user = recentLeaderboard.document.levels[recentLeaderboard.document.levels.length - 1];
    }

    const userLevel = await getOneDatabase(UserLevel, { guildId: xpInfo.guild.id, "levelData.userId": xpInfo.member.id }, () => new UserLevel({ guildId: xpInfo.guild.id, levelData: { userId: xpInfo.member.id } }));

    userLevel.document.levelData.xp += xpInfo.xp;
    user.xp += xpInfo.xp;
    let levelChannel = xpInfo.channel;
    if (serverInfo.document.levelChannel) {
        const temp = await getTextChannelById(serverInfo.document.levelChannel, xpInfo.guild);
        if (temp) levelChannel = temp;
    }

    if (fromMessage) {
        while (user.xp >= getLevelXP(user.level)) {
            user.xp -= getLevelXP(user.level);
            user.level++;
        }
    }

    while (userLevel.document.levelData.xp >= getLevelXP(userLevel.document.levelData.level)) {
        userLevel.document.levelData.xp -= getLevelXP(userLevel.document.levelData.level);
        userLevel.document.levelData.level++;
        let rankDetails: { rankLevel: ModelWrapper<typeof RankLevel.schema>, rank: Role };
        if (ranks) {
            const rankLevel = ranks.find(rank => rank.document.level === userLevel.document.levelData.level);
            if (rankLevel && !rankLevel.isNull()) {
                const rank = await getRoleById(rankLevel.document.roleId, xpInfo.guild);
                if (rank) {
                    if (!member.roles.cache.has(rank.id))
                        member.roles.add(rank).catch(console.error);
                    rankDetails = { rankLevel, rank };
                }
            }
        }
        if (levelUpMessage)
            await showLevelMessage(true, levelChannel, xpInfo.member, userLevel.document.levelData.level, rankDetails);
    }

    await userLevel.save();
    await recentLeaderboard.save();
}

export async function showLevelMessage(levelUp: boolean, levelChannel: BaseGuildTextChannel, member: GuildMember, level: number, rankDetails: { rankLevel: ModelWrapper<typeof RankLevel.schema>, rank: Role }) {
    const userSettings = await getServerUserSettings(member.id, levelChannel.guildId);

    if (userSettings.document.levelPing === undefined) {
        userSettings.document.levelPing = false;
    }

    const options: BaseMessageOptions = {
        content: Localisation.getLocalisation(levelUp ? "xp.level.up" : "xp.level.down", member, level)
    };

    if (userSettings.document.levelPing) {
        options.allowedMentions = { users: [member.id] };
    }

    await levelChannel.send(options);
    if (rankDetails && !rankDetails.rankLevel.isNull()) {
        await levelChannel.send(Localisation.getLocalisation(levelUp ? "xp.transformation.earn" : "xp.transformation.lost", member, capitalise(rankDetails.rank.name)));
        if (rankDetails.rankLevel.document.gifs && rankDetails.rankLevel.document.gifs.length) {
            await levelChannel.send(rankDetails.rankLevel.document.gifs[Math.floor(Math.random() * rankDetails.rankLevel.document.gifs.length)]);
        }
    }
}

export async function getLeaderboardPosition(member: GuildMember) {
    const levels = await getDatabase(UserLevel, { guildId: member.guild.id });

    return getLeaderboardPositionFromList(member, levels.map(l => l.document.levelData));
}

export async function getWeeklyLeaderboardPosition(member: GuildMember) {

    const recentLeaderboard = await getOneDatabase(WeeklyLeaderboard, { guildId: member.guild.id }, () => new WeeklyLeaderboard({ guildId: member.guild.id }));

    return getLeaderboardPositionFromList(member, recentLeaderboard.document.levels);
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
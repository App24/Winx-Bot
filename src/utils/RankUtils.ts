import { loadImage } from "canvas";
import { User } from "discord.js";
import { existsSync } from "fs";
import { RankLevel, RankLevelData } from "../structs/databaseTypes/RankLevel";
import { UserLevel } from "../structs/databaseTypes/UserLevel";
import { WinxCharacter } from "../structs/WinxCharacters";
import { getDatabase, getOneDatabase } from "./Utils";
import { Document } from "mongoose";
import { ModelWrapper } from "../structs/ModelWrapper";
import { ServerUserSettings } from "../structs/databaseTypes/ServerUserSettings";

export async function getRank(level: number, guildId: string) {
    const rank = await getOneDatabase(RankLevel, { guildId, level });
    return rank;
}

export async function getNextRank(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.document.level - b.document.level;
    });

    let rankToReturn: ModelWrapper<typeof RankLevel.schema> = new ModelWrapper(null);
    for (const rank of ranks) {
        if (rank.document.level <= currentLevel) continue;
        rankToReturn = rank;
        break;
    }

    return rankToReturn;
}

export async function getCurrentRank(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.document.level - b.document.level;
    });

    let rankToReturn: ModelWrapper<typeof RankLevel.schema> = new ModelWrapper(null);
    for (const rank of ranks) {
        if (rank.document.level > currentLevel) break;
        if (rank.document.level <= currentLevel) {
            rankToReturn = rank;
        }
    }

    return rankToReturn;
}

export async function getPreviousRank(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.document.level - b.document.level;
    });

    let currentRank: ModelWrapper<typeof RankLevel.schema> = new ModelWrapper(null);
    for (const rank of ranks) {
        if (rank.document.level > currentLevel) break;
        if (rank.document.level <= currentLevel) {
            currentRank = rank;
        }
    }

    let rankToReturn: ModelWrapper<typeof RankLevel.schema>;
    for (const rank of ranks) {
        if (rank.document.level >= currentLevel || (!currentRank.isNull() && rank.document.level === currentRank.document.level)) break;
        if (rank.document.level < currentLevel) {
            rankToReturn = rank;
        }
    }

    return rankToReturn;
}

export async function getPreviousRanks(currentLevel: number, guildId: string) {
    const ranks = await getDatabase(RankLevel, { guildId });

    if (!ranks.length) return;

    ranks.sort((a, b) => {
        return a.document.level - b.document.level;
    });

    let currentRank: ModelWrapper<typeof RankLevel.schema> = new ModelWrapper(null);
    for (const rank of ranks) {
        if (rank.document.level > currentLevel) break;
        if (rank.document.level <= currentLevel) {
            currentRank = rank;
        }
    }

    const ranksToReturn: ModelWrapper<typeof RankLevel.schema>[] = [];
    for (const rank of ranks) {
        if (rank.document.level >= currentLevel || (!currentRank.isNull() && rank.document.level === currentRank.document.level)) break;
        if (rank.document.level < currentLevel) {
            ranksToReturn.push(rank);
        }
    }

    return ranksToReturn;
}

export async function getServerUserSettings(userId: string, guildId: string) {
    return getOneDatabase(ServerUserSettings, { guildId: guildId, userId: userId }, () => new ServerUserSettings({ guildId: guildId, userId: userId }));
}

export async function getWingsImage(user: User, guildId: string) {
    const serverUserSettings = await getServerUserSettings(user.id, guildId);
    const userLevel = await getOneDatabase(UserLevel, { guildId: guildId, "levelData.userId": user.id }, () => new UserLevel({ guildId: guildId, levelData: { userId: user.id } }));

    let level = userLevel.document.levelData.level;
    if (serverUserSettings.document.wingsLevel >= 0) {
        level = serverUserSettings.document.wingsLevel;
    }

    return getWingsImageByLevel(level, serverUserSettings.document.winxCharacter, guildId);
}

export async function getWingsImageByLevel(level: number, winxCharacter: WinxCharacter, guildId: string) {
    const rank = await getCurrentRank(level, guildId);

    return getWingsImageByRank(rank, winxCharacter);
}

export async function getWingsImageByRank(rank: ModelWrapper<typeof RankLevel.schema>, winxCharacter: WinxCharacter) {
    if (winxCharacter <= 0)
        return;

    if (rank.isNull() || !rank.document.wings)
        return;

    const characterWingFile = Object.values(rank.document.wings)[winxCharacter - 1];

    if (characterWingFile !== "" && existsSync(characterWingFile)) {
        return loadImage(characterWingFile);
    }

    return;
}

/*export async function getRankRoles(guild: Guild, maxLevel = Number.MAX_SAFE_INTEGER) {
    const ranks = await getDatabase(RankLevel, { guildId: guild.id });

    ranks.sort((a, b) => {
        return a.level - b.level;
    });

    const toReturn: { rank: typeof RankLevel, role: Role }[] = [];

    await asyncForEach(ranks, async (rank) => {
        if (rank.level <= maxLevel) {
            const role = await getRoleById(rank.roleId, guild);
            if (!role) return;
            toReturn.push({ rank, role });
        }
    });

    return toReturn;
}*/